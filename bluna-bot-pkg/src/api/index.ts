import { Coins, MnemonicKey, MsgExecuteContract } from "@terra-money/terra.js";

import {
  BlunaBalanceQueryMessage,
  BlunaBalanceResponse,
  IncreaseAllowanceHandleMessage,
  SwapLunaToBlunaHandleMessage,
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

export async function swapLunaToBluna(
  walletMnemonic: string,
  lunaAmount: number,
  expectedBlunaAmount: number
) {
  const wallet = terra.wallet(
    new MnemonicKey({
      mnemonic: walletMnemonic,
    })
  );

  // increase allowance
  const increaseAllowanceHandleMessage: IncreaseAllowanceHandleMessage = {
    increase_allowance: {
      amount: toMicroAmount(expectedBlunaAmount).toString(),
      spender: LUNA_TO_BLUNA_SWAP_CONTRACT_ADDRESS,
    },
  };
  const executeIncreaseAllowance = new MsgExecuteContract(
    wallet.key.accAddress,
    BLUNA_CONTRACT_ADDRESS,
    increaseAllowanceHandleMessage
  );

  // swap
  const swapHandleMessage: SwapLunaToBlunaHandleMessage = {
    swap: {
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
  const swapCoins = new Coins({
    uluna: toMicroAmount(lunaAmount),
  });
  const executeSwap = new MsgExecuteContract(
    wallet.key.accAddress,
    LUNA_TO_BLUNA_SWAP_CONTRACT_ADDRESS,
    swapHandleMessage,
    swapCoins
  );

  const transaction = await wallet.createAndSignTx({
    msgs: [executeIncreaseAllowance, executeSwap],
  });

  const result = await terra.tx.broadcast(transaction);

  return result;
}
