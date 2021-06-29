import { BlockTxBroadcastResult, isTxError } from "@terra-money/terra.js";

import { Config } from "../types";
import {
  simulateLunaToBlunaSwap,
  simulateBlunaToLunaSwap,
  getWalletBalance,
  swapLunaToBluna,
  swapBlunaToLuna,
} from "../api";
import {
  toMicroSeconds,
  fromMicroAmount,
  calculatePremium,
  DEFAULT_INTERVAL,
  DEFAULT_MIN_PERCENTAGE_GAIN,
  DEFAULT_MAX_PERCENTAGE_LOSS,
  DEFAULT_MAX_SWAP_AMOUNT,
  DEFAULT_MIN_SWAP_AMOUNT,
  DEFAULT_CALLBACK,
} from "../utils";

let shouldContinueRunning = true;

export async function run(config: Config): Promise<void> {
  // reset to true in case it was set to false
  shouldContinueRunning = true;

  const {
    walletAddress,
    walletMnemonic,
    interval = DEFAULT_INTERVAL,
    minPercentageGain = DEFAULT_MIN_PERCENTAGE_GAIN,
    maxPercentageLoss = DEFAULT_MAX_PERCENTAGE_LOSS,
    minSwapAmount = DEFAULT_MIN_SWAP_AMOUNT,
    maxSwapAmount = DEFAULT_MAX_SWAP_AMOUNT,
    onSuccess = DEFAULT_CALLBACK,
    onError = DEFAULT_CALLBACK,
    debug = DEFAULT_CALLBACK,
  } = config;

  const walletBalance = await getWalletBalance(walletAddress);
  const lunaBalance = Math.min(
    fromMicroAmount(walletBalance.uluna),
    maxSwapAmount
  );
  const blunaBalance = Math.min(
    fromMicroAmount(walletBalance.ubluna),
    maxSwapAmount
  );

  const [lunaSwapSimulation, blunaSwapSimulation] = await Promise.all([
    simulateLunaToBlunaSwap(lunaBalance),
    simulateBlunaToLunaSwap(blunaBalance),
  ]);

  const expectedBlunaAmount = fromMicroAmount(lunaSwapSimulation.return_amount);
  const lunaSwapPremium = calculatePremium(
    Math.min(maxSwapAmount, lunaBalance),
    expectedBlunaAmount
  );

  const expectedLunaAmount = fromMicroAmount(blunaSwapSimulation.return_amount);
  const blunaSwapPremium = calculatePremium(
    Math.min(maxSwapAmount, blunaBalance),
    expectedLunaAmount
  );

  const shouldSwapLuna =
    lunaBalance >= minSwapAmount && lunaSwapPremium >= minPercentageGain;
  const shouldSwapBluna =
    blunaBalance >= minSwapAmount && blunaSwapPremium <= maxPercentageLoss;
  const transactionResult: BlockTxBroadcastResult | undefined = shouldSwapLuna
    ? await swapLunaToBluna(walletMnemonic, lunaBalance, expectedBlunaAmount)
    : shouldSwapBluna
    ? await swapBlunaToLuna(walletMnemonic, blunaBalance)
    : undefined;

  if (transactionResult === undefined) {
    // neither swap occurred
  } else {
    if (isTxError(transactionResult)) {
      await onError(transactionResult);
    } else {
      await onSuccess(transactionResult);
    }
  }

  if (shouldContinueRunning) {
    setTimeout(() => run(config), toMicroSeconds(interval));
  }

  await debug({
    initialWalletBalance: walletBalance,
    availableLunaAmount: lunaBalance,
    lunaSwapSimulation,
    lunaSwapPremium,
    availableBlunaAmount: blunaBalance,
    blunaSwapSimulation,
    blunaSwapPremium,
    transactionResult,
  });
}

export function stop(): void {
  shouldContinueRunning = false;
}
