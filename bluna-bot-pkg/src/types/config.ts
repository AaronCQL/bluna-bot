import { BlockTxBroadcastResult } from "@terra-money/terra.js";

import {
  SwapLunaToBlunaSimulationResponse,
  SwapBlunaToLunaSimulationResponse,
  WalletBalance,
} from "./api";

export type CallbackFunction = (
  transactionResult?: BlockTxBroadcastResult | undefined
) => any;

export type DebugFunction = (info: {
  initialWalletBalance?: WalletBalance | undefined;
  lunaSwapAmount?: number | undefined;
  swapLunaToBlunaSimulation?: SwapLunaToBlunaSimulationResponse | undefined;
  blunaSwapAmount?: number | undefined;
  swapBlunaToLunaSimulation?: SwapBlunaToLunaSimulationResponse | undefined;
  transactionResult?: BlockTxBroadcastResult | undefined;
}) => any;

export type Config = {
  walletAddress: string;
  walletMnemonic: string;
  interval?: number | undefined; // min delay in seconds before running the next round
  minPercentageGain?: number | undefined; // min percentage gain when swapping luna for bluna
  maxPercentageLoss?: number | undefined; // max percentage loss when swapping bluna for luna
  minLunaSwapAmount?: number | undefined; // min number of luna to swap at one go
  maxLunaSwapAmount?: number | undefined; // max number of luna to swap at one go
  minBlunaSwapAmount?: number | undefined; // min number of luna to swap at one go
  maxBlunaSwapAmount?: number | undefined; // max number of luna to swap at one go
  slippagePercentage?: number | undefined; // slippage percentage when swapping
  onSwapSuccess?: CallbackFunction | undefined;
  onSwapError?: CallbackFunction | undefined;
  debug?: DebugFunction | undefined;
};
