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
  availableLunaAmount?: number | undefined;
  swapLunaToBlunaSimulation?: SwapLunaToBlunaSimulationResponse | undefined;
  availableBlunaAmount?: number | undefined;
  swapBlunaToLunaSimulation?: SwapBlunaToLunaSimulationResponse | undefined;
  transactionResult?: BlockTxBroadcastResult | undefined;
}) => any;

export type Config = {
  walletAddress: string;
  walletMnemonic: string;
  interval?: number | undefined; // min delay in seconds before running the next round
  minPercentageGain?: number | undefined; // min percentage gain when swapping luna for bluna
  maxPercentageLoss?: number | undefined; // max percentage loss when swapping bluna for luna
  minSwapAmount?: number | undefined; // min number of luna or bluna to swap at one go
  maxSwapAmount?: number | undefined; // max number of luna or bluna to swap at one go
  onSuccess?: CallbackFunction | undefined;
  onError?: CallbackFunction | undefined;
  debug?: DebugFunction | undefined;
};
