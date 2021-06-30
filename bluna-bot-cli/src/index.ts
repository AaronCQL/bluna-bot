#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import {
  DEFAULT_INTERVAL,
  DEFAULT_MIN_PERCENTAGE_GAIN,
  DEFAULT_MAX_PERCENTAGE_LOSS,
  DEFAULT_MIN_SWAP_AMOUNT,
  DEFAULT_MAX_SWAP_AMOUNT,
  Config,
  run,
} from "bluna-bot-pkg";

const VERSION: string = require("../package.json").version;

function greet() {
  const banner = figlet
    .textSync("bLUNA Bot", {
      font: "Big Money-ne",
    })
    .trim();
  console.log("\n", chalk.bold.green(banner), "\n");
}

function initConfig() {
  program
    .version(VERSION)
    .name("bluna-bot")
    .usage('-a "wallet address here" -m "wallet mnemonic here" [options]')
    .description("CLI tool to automate swapping between LUNA and bLUNA")
    .requiredOption("-a, --address <wallet address>", "Terra wallet address")
    .requiredOption(
      "-m, --mnemonic <wallet mnemonic>",
      "Terra wallet mnemonic key"
    )
    .option(
      "--interval <seconds>",
      "delay in seconds before running the next round",
      Number,
      DEFAULT_INTERVAL
    )
    .option(
      "--min-gain <percentage>",
      "minimum percentage gain when swapping LUNA for bLUNA",
      Number,
      DEFAULT_MIN_PERCENTAGE_GAIN
    )
    .option(
      "--max-loss <percentage>",
      "maximum percentage loss when swapping bLUNA for LUNA",
      Number,
      DEFAULT_MAX_PERCENTAGE_LOSS
    )
    .option(
      "--min-swap-amount <amount>",
      "minimum number of LUNA or bLUNA to use when swapping",
      Number,
      DEFAULT_MIN_SWAP_AMOUNT
    )
    .option(
      "--max-swap-amount <amount>",
      "maximum number of LUNA or bLUNA to use when swapping",
      Number,
      DEFAULT_MAX_SWAP_AMOUNT
    )
    .option("--verbose", "prints out debug information for every run");
}

function parseArgs() {
  return program.parse(process.argv).opts();
}

function printConfig(
  interval: number,
  minGain: number,
  maxLoss: number,
  minSwapAmount: number,
  maxSwapAmount: number
) {
  console.log(
    chalk.bold("Running with the following configurations:\n") +
      ` - Interval: ${interval} seconds\n` +
      ` - Minimum percentage gain: ${minGain}%\n` +
      ` - Maximum percentage loss: ${maxLoss}%\n` +
      ` - Minimum swap amount: ${minSwapAmount}\n` +
      ` - Maximum swap amount: ${maxSwapAmount}\n`
  );
}

async function main() {
  // clear console text
  clear();
  // greet user
  greet();
  // init commander config
  initConfig();
  // parse args via commander
  const {
    address,
    mnemonic,
    interval,
    minGain,
    maxLoss,
    minSwapAmount,
    maxSwapAmount,
    verbose,
  } = parseArgs();
  // print config back to user
  printConfig(interval, minGain, maxLoss, minSwapAmount, maxSwapAmount);

  const botConfig: Config = {
    walletAddress: address,
    walletMnemonic: mnemonic,
    interval: interval,
    minPercentageGain: minGain,
    maxPercentageLoss: maxLoss,
    minSwapAmount: minSwapAmount,
    maxSwapAmount: maxSwapAmount,
    debug: (info) => {
      if (verbose) {
        console.log("debug:", info, "\n");
      }
    },
    onSwapSuccess: (transactionResult) => {
      console.log(chalk.bold.green("Swap success!"));
      console.log("transaction result:", transactionResult, "\n");
    },
    onSwapError: (transactionResult) => {
      console.log(chalk.bold.red("Swap error!"));
      console.log("transaction result:", transactionResult, "\n");
    },
  };

  // run the program
  await run(botConfig);
}

main();
