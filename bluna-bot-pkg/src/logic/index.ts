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
  DEFAULT_INTERVAL,
  DEFAULT_MIN_PERCENTAGE_GAIN,
  DEFAULT_MAX_PERCENTAGE_LOSS,
  DEFAULT_MAX_SWAP_AMOUNT,
  DEFAULT_MIN_SWAP_AMOUNT,
  DEFAULT_CALLBACK,
} from "../utils";

let shouldContinueRunning = true;

export async function run(config: Config): Promise<void> {
  // set to true in case it was set to false
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

  const [swapLunaToBlunaSimulation, swapBlunaToLunaSimulation] =
    await Promise.all([
      simulateLunaToBlunaSwap(lunaBalance),
      simulateBlunaToLunaSwap(blunaBalance),
    ]);

  const shouldSwapLuna =
    lunaBalance >= minSwapAmount &&
    swapLunaToBlunaSimulation.percentageGain >= minPercentageGain;
  const shouldSwapBluna =
    blunaBalance >= minSwapAmount &&
    swapBlunaToLunaSimulation.percentageLoss <= maxPercentageLoss;
  const transactionResult: BlockTxBroadcastResult | undefined = shouldSwapLuna
    ? await swapLunaToBluna(
        walletMnemonic,
        lunaBalance,
        fromMicroAmount(
          swapLunaToBlunaSimulation.contractResponse.return_amount
        )
      )
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
    swapLunaToBlunaSimulation,
    availableBlunaAmount: blunaBalance,
    swapBlunaToLunaSimulation,
    transactionResult,
  });
}

export function stop(): void {
  shouldContinueRunning = false;
}
