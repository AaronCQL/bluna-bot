import {
  BLUNA_CONTRACT_ADDRESS,
  LUNA_BLUNA_SWAP_CONTRACT_ADDRESS,
} from "../utils";

export type SwapLunaToBlunaSimulationQueryMessage = {
  simulation: {
    offer_asset: {
      amount: string;
      info: {
        native_token: {
          denom: "uluna";
        };
      };
    };
  };
};

export type SwapBlunaToLunaSimulationQueryMessage = {
  simulation: {
    offer_asset: {
      amount: string;
      info: {
        token: {
          contract_addr: typeof BLUNA_CONTRACT_ADDRESS;
        };
      };
    };
  };
};

export type SwapSimulationContractResponse = {
  return_amount: string;
  spread_amount: string;
  commission_amount: string;
};

export type SwapLunaToBlunaSimulationResponse = {
  contractResponse: SwapSimulationContractResponse;
  percentageGain: number;
};

export type SwapBlunaToLunaSimulationResponse = {
  contractResponse: SwapSimulationContractResponse;
  percentageLoss: number;
};

export type BlunaBalanceQueryMessage = {
  balance: {
    address: string;
  };
};

export type BlunaBalanceResponse = {
  balance: string;
};

export type WalletBalance = {
  uust: string;
  uluna: string;
  ubluna: string;
};

export type IncreaseAllowanceHandleMessage = {
  increase_allowance: {
    amount: string;
    spender: typeof LUNA_BLUNA_SWAP_CONTRACT_ADDRESS;
  };
};

export type SwapLunaToBlunaHandleMessage = {
  swap: {
    offer_asset: {
      amount: string;
      info: {
        native_token: {
          denom: "uluna";
        };
      };
    };
    belief_price: string;
    max_spread: string;
  };
};

export type SwapBlunaToLunaSendMsg = {
  swap: {
    belief_price: string;
    max_spread: string;
  };
};

export type SwapBlunaToLunaHandleMessage = {
  send: {
    amount: string;
    contract: typeof LUNA_BLUNA_SWAP_CONTRACT_ADDRESS;
    msg: string; // SwapBlunaToLunaSendMsg in base64 encoding
  };
};
