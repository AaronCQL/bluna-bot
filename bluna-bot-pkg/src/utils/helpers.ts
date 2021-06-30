export function toMicroAmount(amount: number): number {
  return Math.round(amount * 1000000);
}

export function fromMicroAmount(microAmount: number | string): number {
  return Number(microAmount) / 1000000;
}

export function toMicroSeconds(seconds: number): number {
  return seconds * 1000;
}

export function calculatePercentageGain(from: number, to: number) {
  return ((to - from) / from) * 100;
}

export function calculatePercentageLoss(from: number, to: number) {
  return ((from - to) / from) * 100;
}
