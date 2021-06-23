export function toMicroAmount(amount: number): number {
  return Math.round(amount * 1000000);
}

export function waitSeconds(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
