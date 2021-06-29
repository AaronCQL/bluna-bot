export function toMicroAmount(amount: number): number {
  return Math.round(amount * 1000000);
}

export function fromMicroAmount(microAmount: number | string): number {
  return Number(microAmount) / 1000000;
}

export function toMicroSeconds(seconds: number): number {
  return seconds * 1000;
}

export function calculatePremium(x: number, y: number) {
  const largerNum = Math.max(x, y);
  const smallerNum = Math.min(x, y);
  return ((largerNum - smallerNum) / smallerNum) * 100;
}
