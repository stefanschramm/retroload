const dataMap = {
  true: 1.0,
  false: -1.0,
  null: 0.0,
};

export class PcmRecorder {
  constructor(audioContext) {
    this.audioContext = audioContext;
  }

  initialize(sampleRate) {
    this.data = [];
    this.sampleRate = sampleRate;
  }

  pushSample(value) {
    this.data.push(value);
  }

  getAudioContextBuffer() {
    if (this.data.length === 0) {
      console.error('No data recorded!');
      return;
    }

    const buffer = this.audioContext.createBuffer(1, this.data.length, this.sampleRate);
    const channelData = buffer.getChannelData(0);

    let offset = 0;
    for (const value of this.data) {
      channelData[offset += 1] = dataMap[value];
    }
    return buffer;
  }
}
