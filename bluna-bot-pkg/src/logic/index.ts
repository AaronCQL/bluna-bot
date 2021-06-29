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
  DEFAULT_LUNA_TO_BLUNA_PREMIUM_THRESHOLD,
  DEFAULT_BLUNA_TO_LUNA_PREMIUM_THRESHOLD,
  DEFAULT_MAX_SWAP_AMOUNT,
  DEFAULT_MIN_SWAP_AMOUNT,
  DEFAULT_CALLBACK,
} from "../utils";

let shouldContinueRunning = true;

export async function run(config: Config): Promise<void> {
  const {
    walletAddress,
    walletMnemonic,
    interval = DEFAULT_INTERVAL,
    lunaToBlunaPremiumThreshold = DEFAULT_LUNA_TO_BLUNA_PREMIUM_THRESHOLD,
    blunaToLunaPremiumThreshold = DEFAULT_BLUNA_TO_LUNA_PREMIUM_THRESHOLD,
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

  if (
    lunaBalance >= minSwapAmount &&
    lunaSwapPremium >= lunaToBlunaPremiumThreshold
  ) {
    res = await swapLunaToBluna(
      walletMnemonic,
      lunaBalance,
      expectedBlunaAmount
    );
  }

  if (
    blunaBalance >= minSwapAmount &&
    blunaSwapPremium <= blunaToLunaPremiumThreshold
  ) {
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
