<!-- omit in toc -->
# `bluna-bot-pkg`

Helper library to automate swapping between LUNA and bLUNA.

- [Installation](#installation)
- [Usage](#usage)

## Installation

```sh
yarn add bluna-bot-pkg
```

## Usage

```ts
import { run, stop } from "bluna-bot-pkg";

run({
  walletAddress: "terraAddressHere", // REQUIRED!
  walletMnemonic: "terra wallet mnemonic here", // REQUIRED!
});
```

Refer to [`config.ts`](https://github.com/AaronCQL/bluna-bot/blob/main/bluna-bot-pkg/src/types/config.ts) for the full list of configurations that the `run` function can accept.
