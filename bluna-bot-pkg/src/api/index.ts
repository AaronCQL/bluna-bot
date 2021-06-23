import {
  BlunaBalanceQueryMessage,
  BlunaBalanceResponse,
  SwapSimulationQueryMessage,
  SwapSimulationResponse,
  WalletBalance,
} from "../types";
import {
  terra,
  toMicroAmount,
  LUNA_TO_BLUNA_SWAP_CONTRACT_ADDRESS,
  BLUNA_CONTRACT_ADDRESS,
} from "../utils";

export async function simulateLunaToBlunaSwap(
  lunaAmount: number = 1
): Promise<SwapSimulationResponse> {
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

export async function simulateBlunaToLunaSwap(
  blunaAmount: number = 1
): Promise<SwapSimulationResponse> {
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

export async function getWalletBalance(
  address: string
): Promise<WalletBalance> {
  const blunaBalanceQueryMessage: BlunaBalanceQueryMessage = {
    balance: {
      address: address,
    },
  };

  const [{ balance: blunaBalance }, coins] = await Promise.all([
    // bluna
    terra.wasm.contractQuery(
      BLUNA_CONTRACT_ADDRESS,
      blunaBalanceQueryMessage
    ) as Promise<BlunaBalanceResponse>,
    // ust and luna
    terra.bank.balance(address),
  ]);

  return {
    uust: coins.get("uusd")?.amount.toString() ?? "0",
    uluna: coins.get("uluna")?.amount.toString() ?? "0",
    ubluna: blunaBalance,
  };
}
