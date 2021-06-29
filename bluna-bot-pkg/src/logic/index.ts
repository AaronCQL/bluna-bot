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
    maxSwapAmount = DEFAULT_MAX_SWAP_AMOUNT,
    minSwapAmount = DEFAULT_MIN_SWAP_AMOUNT,
    onSuccess = DEFAULT_CALLBACK,
    onError = DEFAULT_CALLBACK,
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

  let res: BlockTxBroadcastResult | undefined;

  if (lunaBalance >= minSwapAmount && lunaSwapPremium >= minPercentageGain) {
    res = await swapLunaToBluna(
      walletMnemonic,
      lunaBalance,
      expectedBlunaAmount
    );
  }

  if (blunaBalance >= minSwapAmount && blunaSwapPremium <= maxPercentageLoss) {
    res = await swapBlunaToLuna(walletMnemonic, blunaBalance);
  }

  if (res === undefined) {
    // neither swap occurred
  } else {
    if (isTxError(res)) {
      await onError(res);
    } else {
      await onSuccess(res);
    }
  }

  if (shouldContinueRunning) {
    setTimeout(() => run(config), toMicroSeconds(interval));
  }
}

export function stop(): void {
  shouldContinueRunning = false;
}
