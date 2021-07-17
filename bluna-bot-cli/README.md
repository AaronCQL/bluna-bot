<!-- omit in toc -->
# `bluna-bot-cli`

> Node CLI wrapper for the [`bluna-bot-pkg`](https://github.com/AaronCQL/bluna-bot/tree/main/bluna-bot-pkg) package.

Automates swapping between LUNA and bLUNA.

- [Installation](#installation)
- [Usage](#usage)
  - [Configurations](#configurations)
  - [Example](#example)

## Installation

Make sure you have [node](https://nodejs.org/en/) installed first. Then, run:

```sh
# for npm users:
npm i -g bluna-bot-cli

# for yarn users:
yarn global add bluna-bot-cli
```

## Usage

After installing, use **`bluna-bot`** in your CLI to access the program.

Display help messages:

```sh
bluna-bot -h
```

Display the current version:

```sh
bluna-bot -V
```

Use the `--verbose` option to print out debug information for every run (not recommended):

```sh
bluna-bot [options] --verbose
```

### Configurations

Other than the wallet address and wallet mnemonic, all other fields are optional and comes with a default value (use `bluna-bot -h` to check).

- **`-a <wallet address>`**: Terra wallet address
- **`-m <wallet mnemonic>`**: Terra wallet mnemonic key
- `--interval <seconds>`: delay in seconds before running the next round
- `--min-gain <percentage>`: minimum percentage gain when swapping LUNA for bLUNA
  - eg. if `<percentage>` is 13, the swap will only commence if swapping the current amount of LUNA will net a 13% increase in the corresponding bLUNA amount
- `--max-loss <percentage>`: maximum percentage loss when swapping bLUNA for LUNA
  - eg. if `<percentage>` is 1.5, the swap will only commence if swapping the current amount of bLUNA will net a 1.5% decrease in the corresponding LUNA amount
- `--min-luna-swap-amount <amount>`: minimum number of LUNA to use when swapping
- `--max-luna-swap-amount <amount>`: maximum number of LUNA to use when swapping
- `--min-bluna-swap-amount <amount>`: minimum number of bLUNA to use when swapping
- `--max-bluna-swap-amount <amount>`: maximum number of bLUNA to use when swapping
- `--slippage <percentage>`: percentage slippage to use when swapping
  - Note: the `min-gain` and `max-loss` settings *do not* take into account the `slippage` set
  - Terraswap's default slippage is `1`, the default slippage used in this program is `0.5`
- `--stop-on-errors`: when present, stops execution of the program when met with any unknown errors
  - Be default, unknown errors are ignored since queries to the blockchain may occasionally throw network errors
- `--verbose`: when present, prints out debug information for every run
  - Not recommended unless developing or debugging

### Example

```sh
bluna-bot -a "terraAddressHere" \
          -m "terra wallet mnemonic here" \
          --interval 4 \
          --min-gain 13 \
          --max-loss 1.5 \
          --min-swap-amount 100 \
          --slippage 0.1 \
          --verbose
```
