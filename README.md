# Cardano Connect web component

This component provides a button, a list of browser based [Cardano](https://cardano.org/) wallets.
When the user selects a wallet, it will attempt to connect via the browser plugin. If successful
it will emit an event *CardanoConnectWallet* or in the case of an error *CardanoConnectWalletError*.

## Component API

Component [documentation](custom-elements.md)

## How to use

### Include the script

```HTML
<script src="src/cardano-connect.js"></script>
```

### Override optional CSS (optional)

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
<cardano-connect  text="Connect wallet"></cardano-connect>
```

**text* attribute is optional, the default value is *Connect wallet*

## How does it work?

When a user clicks the button a dropdown list of Cardano browser based wallets is displayed
THen the user selects one, they are prompted by the wallet's browser plugin to sign and connect
Once connected, the element will emit an event `CardanoConnectWallet` with contains the following:

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
