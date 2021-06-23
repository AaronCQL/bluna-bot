import { SwapSimulationQueryMessage, SwapSimulationResponse } from "../types";
import {
  terra,
  toMicroAmount,
  LUNA_TO_BLUNA_SWAP_CONTRACT_ADDRESS,
  BLUNA_CONTRACT_ADDRESS,
} from "../utils";

export async function simulateLunaToBlunaSwap(lunaAmount: number = 1) {
  const queryMessage: SwapSimulationQueryMessage = {
    simulation: {
      offer_asset: {
        amount: toMicroAmount(lunaAmount).toString(),
        info: {
          native_token: {
            denom: "uluna",
          },
        },
      },
    },
  };

  return terra.wasm.contractQuery(
    LUNA_TO_BLUNA_SWAP_CONTRACT_ADDRESS,
    queryMessage
  ) as Promise<SwapSimulationResponse>;
}

export async function simulateBlunaToLunaSwap(blunaAmount: number = 1) {
  const queryMessage: SwapSimulationQueryMessage = {
    simulation: {
      offer_asset: {
        amount: toMicroAmount(blunaAmount).toString(),
        info: {
          token: {
            contract_addr: BLUNA_CONTRACT_ADDRESS,
          },
        },
      },
    },
  };

  return terra.wasm.contractQuery(
    LUNA_TO_BLUNA_SWAP_CONTRACT_ADDRESS,
    queryMessage
  ) as Promise<SwapSimulationResponse>;
}
