# Cardano Connect web component

This component provides a button, a list of browser based [Cardano](https://cardano.org/) wallets.
When the user selects a wallet, it will attempt to connect via the browser plugin. If successful
it will emit an event *CardanoConnectWallet* or in the case of an error *CardanoConnectWalletError*.

**Make a donation** addr1qyv48l03e9gap3vxxvuc60l8d4hpgx7cf86p3tmjte70sc75dl8x2jk2urg38kkrpcmlkdn020cjqckma0t8favg62mqnjlu30

## Supported Cardano wallets

- [Eternl](https://eternl.io/)
- [Flint](https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj)
- [Nami](https://namiwallet.io/)
- [Yoroi](http://yoroiwallet.com/)

## Component API

Component [documentation](custom-elements.md)

## How to use

### Include the script

```HTML
<script src="src/cardano-connect.js"></script>
```

### Override CSS (optional)

```HTML
<style>
  cardano-connect {
    --btn-bg-color: purple;
    --btn-text-color: white;
    --btn-hover-bg-color: #995799;
    --btn-hover-text-color: white;
  }
</style>
```

### Embed component

```HTML
<cardano-connect text="Connect wallet"></cardano-connect>
```

**text** attribute is optional, the default value is *Connect wallet*

## How does it work?

When a user clicks the button a dropdown list of Cardano browser based wallets is displayed.
The user selects one, then they are prompted by the wallet's browser plugin to sign and connect.
Once connected, the element will emit an event `CardanoConnectWallet` which contains the following:

* balance: selected wallet balance
* name: selected wallet name
* icon: selected wallet icon
* api: Cardano API object with following properties:
  * getNetworkId
  * getBalance
  * getUtxos
  * getUsedAddresses
  * getUnusedAddresses
  * getRewardAddresses
  * getChangeAddress
  * signData
  * signTx
  * submitTx

If an error occurs the element will emit an event `CardanoConnectWalletError` which contains the following:

* code: error code
* info: error info
* name: selected wallet name
* icon: selected wallet icon

Read more: [https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030)

## Listen for success

```JavaScript
document.getElementsByTagName('cardano-connect')[0].addEventListener(
  'CardanoConnectWallet',
  (evt) => {
    const { detail } = evt;
    console.log(detail);
  },
false);
```

## Listen for error

```JavaScript
document.getElementsByTagName('cardano-connect')[0].addEventListener(
  'CardanoConnectWalletError',
  (evt) => {
    const { detail } = evt;
    console.log(detail);
  },
false);
```
