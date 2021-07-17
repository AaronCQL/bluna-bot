import {
  Coins,
  MnemonicKey,
  MsgExecuteContract,
  BlockTxBroadcastResult,
} from "@terra-money/terra.js";

import {
  BlunaBalanceQueryMessage,
  BlunaBalanceResponse,
  IncreaseAllowanceHandleMessage,
  SwapBlunaToLunaSendMsg,
  SwapBlunaToLunaHandleMessage,
  SwapLunaToBlunaHandleMessage,
  SwapLunaToBlunaSimulationQueryMessage,
  SwapBlunaToLunaSimulationQueryMessage,
  SwapLunaToBlunaSimulationResponse,
  SwapBlunaToLunaSimulationResponse,
  SwapSimulationContractResponse,
  WalletBalance,
} from "../types";
import {
  terra,
  toMicroAmount,
  LUNA_BLUNA_SWAP_CONTRACT_ADDRESS,
  BLUNA_CONTRACT_ADDRESS,
  calculatePercentageGain,
  fromMicroAmount,
  calculatePercentageLoss,
} from "../utils";

export async function simulateLunaToBlunaSwap(
  lunaAmount: number = 1
): Promise<SwapLunaToBlunaSimulationResponse> {
  const queryMessage: SwapLunaToBlunaSimulationQueryMessage = {
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

  const contractResponse: SwapSimulationContractResponse =
    await terra.wasm.contractQuery(
      LUNA_BLUNA_SWAP_CONTRACT_ADDRESS,
      queryMessage
    );
  const percentageGain = calculatePercentageGain(
    lunaAmount,
    fromMicroAmount(contractResponse.return_amount)
  );

  return {
    contractResponse,
    percentageGain,
  };
}

export async function simulateBlunaToLunaSwap(
  blunaAmount: number = 1
): Promise<SwapBlunaToLunaSimulationResponse> {
  const queryMessage: SwapBlunaToLunaSimulationQueryMessage = {
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

  const contractResponse: SwapSimulationContractResponse =
    await terra.wasm.contractQuery(
      LUNA_BLUNA_SWAP_CONTRACT_ADDRESS,
      queryMessage
    );
  const percentageLoss = calculatePercentageLoss(
    blunaAmount,
    fromMicroAmount(contractResponse.return_amount)
  );

  return {
    contractResponse,
    percentageLoss,
  };
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
  expectedBlunaAmount: number,
  slippagePercentage: number
): Promise<BlockTxBroadcastResult> {
  const wallet = terra.wallet(
    new MnemonicKey({
      mnemonic: walletMnemonic,
    })
  );

  // increase allowance
  const increaseAllowanceHandleMessage: IncreaseAllowanceHandleMessage = {
    increase_allowance: {
      amount: toMicroAmount(expectedBlunaAmount).toString(),
      spender: LUNA_BLUNA_SWAP_CONTRACT_ADDRESS,
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
      belief_price: (lunaAmount / expectedBlunaAmount).toString(),
      max_spread: (slippagePercentage / 100).toString(),
    },
  };
  const swapCoins = new Coins({
    uluna: toMicroAmount(lunaAmount),
  });
  const executeSwap = new MsgExecuteContract(
    wallet.key.accAddress,
    LUNA_BLUNA_SWAP_CONTRACT_ADDRESS,
    swapHandleMessage,
    swapCoins
  );

  const transaction = await wallet.createAndSignTx({
    msgs: [executeIncreaseAllowance, executeSwap],
  });

  const result = await terra.tx.broadcast(transaction);

  return result;
}

export async function swapBlunaToLuna(
  walletMnemonic: string,
  blunaAmount: number,
  expectedLunaAmount: number,
  slippagePercentage: number
): Promise<BlockTxBroadcastResult> {
  const wallet = terra.wallet(
    new MnemonicKey({
      mnemonic: walletMnemonic,
    })
  );

  const swapMsg: SwapBlunaToLunaSendMsg = {
    swap: {
      belief_price: (blunaAmount / expectedLunaAmount).toString(),
      max_spread: (slippagePercentage / 100).toString(),
    },
  };
  const base64SwapMsg = Buffer.from(JSON.stringify(swapMsg)).toString("base64");

  const swapHandleMessage: SwapBlunaToLunaHandleMessage = {
    send: {
      amount: toMicroAmount(blunaAmount).toString(),
      contract: LUNA_BLUNA_SWAP_CONTRACT_ADDRESS,
      msg: base64SwapMsg,
    },
  };
  const executeSwap = new MsgExecuteContract(
    wallet.key.accAddress,
    BLUNA_CONTRACT_ADDRESS,
    swapHandleMessage
  );

  const transaction = await wallet.createAndSignTx({
    msgs: [executeSwap],
  });

  const result = await terra.tx.broadcast(transaction);

  return result;
}
