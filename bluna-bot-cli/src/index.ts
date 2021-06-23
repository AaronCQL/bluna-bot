import {
  simulateLunaToBlunaSwap,
  simulateBlunaToLunaSwap,
  // waitSeconds,
} from "bluna-bot-pkg";

async function main() {
  const [lunaToBlunaRes, blunaToLunaRes] = await Promise.all([
    simulateLunaToBlunaSwap(),
    simulateBlunaToLunaSwap(),
  ]);
  console.log("LUNA to bLUNA:", lunaToBlunaRes);
  console.log("bLUNA to LUNA:", blunaToLunaRes);
}

main();
