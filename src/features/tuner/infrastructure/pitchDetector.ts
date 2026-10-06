export class AutocorrelationPitchDetector {
  constructor(
    private readonly minimumCorrelation = 0.82,
    private readonly minimumFrequency = 40,
    private readonly maximumFrequency = 1_000,
  ) {}

  detect(samples: Float32Array, sampleRate: number): number | null {
    if (samples.length < 32 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
      return null;
    }

    const halfLength = Math.floor(samples.length / 2);
    const minimumLag = Math.max(2, Math.floor(sampleRate / this.maximumFrequency));
    const maximumLag = Math.min(
      Math.floor(sampleRate / this.minimumFrequency),
      halfLength - 1,
    );
    if (maximumLag <= minimumLag) return null;

    let mean = 0;
    for (const sample of samples) mean += sample;
    mean /= samples.length;

    let energy = 0;
    for (const sample of samples) {
      const centered = sample - mean;
      energy += centered * centered;
    }
    const rms = Math.sqrt(energy / samples.length);
    if (rms < 0.008) return null;

    const centeredSamples = new Float32Array(samples.length);
    for (let index = 0; index < samples.length; index += 1) {
      centeredSamples[index] = samples[index] - mean;
    }

    const correlations = new Float32Array(maximumLag + 1);
    let bestLag = -1;
    let bestCorrelation = -1;
    for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
      let product = 0;
      let leftEnergy = 0;
      let rightEnergy = 0;
      const limit = samples.length - lag;
      for (let index = 0; index < limit; index += 1) {
        const left = centeredSamples[index];
        const right = centeredSamples[index + lag];
        product += left * right;
        leftEnergy += left * left;
        rightEnergy += right * right;
      }
      const correlation =
        product / Math.sqrt(leftEnergy * rightEnergy || Number.POSITIVE_INFINITY);
      correlations[lag] = correlation;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    for (let lag = minimumLag + 1; lag < maximumLag; lag += 1) {
      if (
        correlations[lag] >= this.minimumCorrelation &&
        correlations[lag] >= correlations[lag - 1] &&
        correlations[lag] >= correlations[lag + 1]
      ) {
        bestLag = lag;
        break;
      }
    }
    if (bestLag < minimumLag || bestCorrelation < this.minimumCorrelation) return null;

    const left = correlations[bestLag - 1] ?? correlations[bestLag];
    const center = correlations[bestLag];
    const right = correlations[bestLag + 1] ?? center;
    const denominator = left - 2 * center + right;
    const adjustment =
      denominator === 0 ? 0 : (0.5 * (left - right)) / denominator;
    const refinedLag = Number.isFinite(adjustment) ? bestLag + adjustment : bestLag;
    const frequency = sampleRate / refinedLag;
    return Number.isFinite(frequency) ? frequency : null;
  }
}
