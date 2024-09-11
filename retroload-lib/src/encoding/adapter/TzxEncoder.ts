import {Logger} from '../../common/logging/Logger.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {Oscillator} from './Oscillator.js';

const fCpu = 3500000;

// Amstrad CPC Constants (.cdt files)
const cpcTzxCycleFactor = 40 / 35;
export const cpcStandardSpeedRecordOptions: DataRecordOptions = {
  pilotPulseLength: 0x091a,
  syncFirstPulseLength: 0x048d,
  syncSecondPulseLength: 0x048d,
  zeroBitPulseLength: 0x048d,
  oneBitPulseLength: 0x091a,
  pilotPulses: 0x1000,
  lastByteUsedBits: 8,
  pauseLengthMs: 0x000a,
};

// ZX Spectrum constants
const zxSpectrumCycleFactor = 1;
const zxSpectrumStandardSpeedRecordOptions: DataRecordOptions = {
  // ZX Spectrum defaults (for non-turbo-speed-data blocks)
  pauseLengthMs: 1000,
  pilotPulseLength: 2168,
  syncFirstPulseLength: 667,
  syncSecondPulseLength: 735,
  zeroBitPulseLength: 855,
  oneBitPulseLength: 1710,
  lastByteUsedBits: 8,
  pilotPulses: 8063,
};

/**
 * Abstract Encoder class used for ZX Spectrum (.tzx), Amstrad CPC (.cdt) and MSX (.tsx).
 *
 * https://github.com/mamedev/mame/blob/master/src/lib/formats/tzx_cas.cpp
 * https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format
 */
export class TzxEncoder {
  public static createForCpc(recorder: RecorderInterface): TzxEncoder {
    return new TzxEncoder(
      recorder,
      cpcTzxCycleFactor,
      cpcStandardSpeedRecordOptions,
    );
  }

  public static createForZxSpectrum(recorder: RecorderInterface): TzxEncoder {
    return new TzxEncoder(
      recorder,
      zxSpectrumCycleFactor,
      zxSpectrumStandardSpeedRecordOptions,
    );
  }

  private readonly oscillator: Oscillator;

  public constructor(
    private readonly recorder: RecorderInterface,
    public readonly tzxCycleFactor: number,
    public readonly standardSpeedRecordOptions: DataRecordOptions,
  ) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordSilenceMs(lengthMs: number): void {
    this.oscillator.recordSilenceMs(lengthMs);
  }

  public recordStandardSpeedDataBlock(blockDataBa: BufferAccess): void {
    this.recordDataBlock(blockDataBa, {
      ...this.standardSpeedRecordOptions,
      pilotPulses: blockDataBa.getUint8(0) < 128 ? 8063 : 3223, // TODO: why?
    });
  }

  public recordDataBlock(blockDataBa: BufferAccess, options: DataRecordOptions): void {
    const pilotSamples = this.tzxCyclesToSamples(options.pilotPulseLength);
    for (let i = 0; i < options.pilotPulses; i++) {
      this.oscillator.recordHalfOscillationSamples(pilotSamples);
    }
    this.recordPulse(options.syncFirstPulseLength);
    this.recordPulse(options.syncSecondPulseLength);
    this.recordPureDataBlock(blockDataBa, options);
  }

  public recordPureDataBlock(blockDataBa: BufferAccess, options: PureDataRecordOptions): void {
    const zeroBitSamples = this.tzxCyclesToSamples(options.zeroBitPulseLength);
    const oneBitSamples = this.tzxCyclesToSamples(options.oneBitPulseLength);

    Logger.debug('TzxEncoder - recordPureDataBlock');
    Logger.debug(blockDataBa.asHexDump());

    for (let i = 0; i < blockDataBa.length(); i++) {
      let byte = blockDataBa.getUint8(i);
      let bits = (i === blockDataBa.length() - 1) ? options.lastByteUsedBits : 8;
      while (bits > 0) {
        const samples = ((byte & 0x80) === 0) ? zeroBitSamples : oneBitSamples;
        this.oscillator.recordHalfOscillationSamples(samples);
        this.oscillator.recordHalfOscillationSamples(samples);
        byte <<= 1;
        bits--;
      }
    }

    this.oscillator.recordSilenceMs(options.pauseLengthMs);
  }

  public recordKansasCityLikeBlock(blockDataBa: BufferAccess, config: KansasCityLikeConfiguration): void {
    const bitDuration = [
      config.zeroPulseLength,
      config.onePulseLength,
    ];
    const bitPulses = [
      config.zeroPulsesInZeroBit,
      config.onePulsesInOneBit,
    ];
    for (let i = 0; i < config.pilotPulses; i++) {
      this.recordPulse(config.pilotPulseLength);
    }
    for (const byte of blockDataBa.bytes()) {
      for (let j = 0; j < config.startBitCount; j++) {
        this.recordPulses(bitDuration[config.startBitValue], bitPulses[config.startBitValue]);
      }
      for (let bit = 0; bit < 8; bit++) {
        const value = (config.msbFirst ? (byte >> (7 - bit)) : (byte >> bit)) & 1;
        this.recordPulses(bitDuration[value], bitPulses[value]);
      }
      for (let j = 0; j < config.stopBitCount; j++) {
        this.recordPulses(bitDuration[config.stopBitValue], bitPulses[config.stopBitValue]);
      }
    }
    this.oscillator.recordSilenceMs(config.pauseAfterBlockMs);
  }

  public recordPulse(length: number): void {
    this.oscillator.recordHalfOscillationSamples(this.tzxCyclesToSamples(length));
  }

  public recordPulses(length: number, count: number): void {
    for (let i = 0; i < count; i++) {
      this.oscillator.recordHalfOscillationSamples(this.tzxCyclesToSamples(length));
    }
  }

  private tzxCyclesToSamples(cycles: number): number {
    return Math.floor((0.5 + ((this.recorder.sampleRate / fCpu) * cycles)) * this.tzxCycleFactor);
  }
}

type PureDataRecordOptions = {
  zeroBitPulseLength: number;
  oneBitPulseLength: number;
  lastByteUsedBits: number;
  pauseLengthMs: number;
};

export type DataRecordOptions = PureDataRecordOptions & {
  pilotPulseLength: number;
  pilotPulses: number;
  syncFirstPulseLength: number;
  syncSecondPulseLength: number;
};

export type KansasCityLikeConfiguration = {
  pauseAfterBlockMs: number;
  pilotPulseLength: number; // tzx cycles
  pilotPulses: number;
  zeroPulseLength: number; // tzx cycles
  onePulseLength: number; // tzx cycles
  zeroPulsesInZeroBit: number;
  onePulsesInOneBit: number;
  startBitCount: number;
  startBitValue: 0 | 1;
  stopBitCount: number;
  stopBitValue: 0 | 1;
  msbFirst: boolean;
};

export const msxKansasCityLikeConfiguration: KansasCityLikeConfiguration = {
  pauseAfterBlockMs: 2000,
  pilotPulseLength: 729,
  pilotPulses: 30720,
  zeroPulseLength: 1458,
  onePulseLength: 729,
  zeroPulsesInZeroBit: 2,
  onePulsesInOneBit: 4,
  startBitCount: 1,
  startBitValue: 0,
  stopBitCount: 2,
  stopBitValue: 0,
  msbFirst: false,
};
