import {
  BASE64_EMPTY_SWAP_MESSAGE,
  BLUNA_CONTRACT_ADDRESS,
  LUNA_BLUNA_SWAP_CONTRACT_ADDRESS,
} from "../utils";

export type SwapSimulationQueryMessage = {
  simulation: {
    offer_asset: {
      amount: string;
      info:
        | {
            // luna to bluna
            native_token: {
              denom: "uluna";
            };
          }
        | {
            // bluna to luna
            token: {
              contract_addr: typeof BLUNA_CONTRACT_ADDRESS;
            };
          };
    };
  };
};

export type SwapSimulationResponse = {
  return_amount: string;
  spread_amount: string;
  commission_amount: string;
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
  };
};

export type SwapBlunaToLunaHandleMessage = {
  send: {
    amount: string;
    contract: typeof LUNA_BLUNA_SWAP_CONTRACT_ADDRESS;
    msg: typeof BASE64_EMPTY_SWAP_MESSAGE; // base64 encoding for `{"swap":{}}`
  };
};
