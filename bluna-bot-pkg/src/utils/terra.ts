import { LCDClient } from "@terra-money/terra.js";

export const terra = new LCDClient({
  URL: "https://lcd.terra.dev",
  chainID: "columbus-4",
});
