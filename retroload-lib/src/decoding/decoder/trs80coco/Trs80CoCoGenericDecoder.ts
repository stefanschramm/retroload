import {BufferAccess} from "../../../common/BufferAccess.js";
import {DecoderSettings, InternalDecoderDefinition, OutputFile} from "../../DecoderManager.js";
import {StreamingSampleToHalfPeriodConverter} from "../../half_period_provider/StreamingSampleToHalfPeriodConverter.js";
import {SampleProvider} from "../../sample_provider/SampleProvider.js";
import {FileDecodingResult, FileDecodingResultStatus} from "../FileDecodingResult.js";
import {Trs80CoCoBlockProcessor} from "./Trs80CoCoBlockProcessor.js";

const definition: InternalDecoderDefinition = {
  format: 'trs80cocogeneric',
  decode,
};
export default definition;

function *decode(sampleProvider: SampleProvider, settings: DecoderSettings): Generator<OutputFile> {
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);
  const blockProcessor = new Trs80CoCoBlockProcessor(streamingHalfPeriodProvider);
  for (const fileDecodingResult of blockProcessor.files()) {
    if (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile') {
      yield mapDecodingResult(fileDecodingResult);
    }
  }
}

function mapDecodingResult(fdr: FileDecodingResult): OutputFile {
  const fileDataBa = BufferAccess.create(256 * fdr.blocks.length);
  for (const block of fdr.blocks) {
    fileDataBa.writeBa(block.data.slice(0, 256)); // the 2 checksum bytes are removed
  }

  return {
    proposedName: undefined,
    data: fileDataBa,
    proposedExtension: 'cas',
    begin: fdr.begin,
    end: fdr.end,
  };
}
