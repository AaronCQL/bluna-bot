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
  DEFAULT_SLIPPAGE_PERCENTAGE,
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
    minLunaSwapAmount = DEFAULT_MIN_SWAP_AMOUNT,
    maxLunaSwapAmount = DEFAULT_MAX_SWAP_AMOUNT,
    minBlunaSwapAmount = DEFAULT_MIN_SWAP_AMOUNT,
    maxBlunaSwapAmount = DEFAULT_MAX_SWAP_AMOUNT,
    slippagePercentage = DEFAULT_SLIPPAGE_PERCENTAGE,
    onSwapSuccess = DEFAULT_CALLBACK,
    onSwapError = DEFAULT_CALLBACK,
    debug = DEFAULT_CALLBACK,
  } = config;

  const walletBalance = await getWalletBalance(walletAddress);
  const lunaBalance = Math.min(
    fromMicroAmount(walletBalance.uluna),
    maxLunaSwapAmount
  );
  const blunaBalance = Math.min(
    fromMicroAmount(walletBalance.ubluna),
    maxBlunaSwapAmount
  );

  const [swapLunaToBlunaSimulation, swapBlunaToLunaSimulation] =
    await Promise.all([
      simulateLunaToBlunaSwap(lunaBalance),
      simulateBlunaToLunaSwap(blunaBalance),
    ]);

  const shouldSwapLuna =
    lunaBalance >= minLunaSwapAmount &&
    swapLunaToBlunaSimulation.percentageGain >= minPercentageGain;
  const shouldSwapBluna =
    blunaBalance >= minBlunaSwapAmount &&
    swapBlunaToLunaSimulation.percentageLoss <= maxPercentageLoss;
  const transactionResult: BlockTxBroadcastResult | undefined = shouldSwapLuna
    ? await swapLunaToBluna(
        walletMnemonic,
        lunaBalance,
        fromMicroAmount(
          swapLunaToBlunaSimulation.contractResponse.return_amount
        ),
        slippagePercentage
      )
    : shouldSwapBluna
    ? await swapBlunaToLuna(
        walletMnemonic,
        blunaBalance,
        fromMicroAmount(
          swapBlunaToLunaSimulation.contractResponse.return_amount
        ),
        slippagePercentage
      )
    : undefined;

  if (transactionResult === undefined) {
    // neither swap occurred
  } else {
    if (isTxError(transactionResult)) {
      await onSwapError(transactionResult);
    } else {
      await onSwapSuccess(transactionResult);
    }
  }

  if (shouldContinueRunning) {
    setTimeout(() => run(config), toMicroSeconds(interval));
  }

  await debug({
    initialWalletBalance: walletBalance,
    lunaSwapAmount: lunaBalance,
    swapLunaToBlunaSimulation,
    blunaSwapAmount: blunaBalance,
    swapBlunaToLunaSimulation,
    transactionResult,
  });
}

export function stop(): void {
  shouldContinueRunning = false;
}
