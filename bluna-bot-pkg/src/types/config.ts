import { BlockTxBroadcastResult } from "@terra-money/terra.js";

export type CallbackFunction = (
  transactionResult?: BlockTxBroadcastResult | undefined
) => any;

export type Config = {
  walletAddress: string;
  walletMnemonic: string;
  interval?: number | undefined; // min delay in seconds before running the next round
  lunaToBlunaPremiumThreshold?: number | undefined; // min percentage premium before luna is swapped for bluna
  blunaToLunaPremiumThreshold?: number | undefined; // min percentage premium before bluna is swapped for luna
  maxSwapAmount?: number | undefined; // max number of luna or bluna to swap at one go
  minSwapAmount?: number | undefined; // min number of luna or bluna to swap at one go
  onSuccess?: CallbackFunction | undefined;
  onError?: CallbackFunction | undefined;
};
