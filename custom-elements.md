# cardano-connect

This component provides a button and a list of browser based Cardano wallets.
A wallet when clicked, will connect it with your site, return the name,
icon, address and Cardano API object to interact with.

## Attributes

| Attribute | Type     | Description                                      |
|-----------|----------|--------------------------------------------------|
| `text`    | `String` | Text used on the button, default is "Connect wallet" |
| `json`    | `String` | If true, then a new event is fired that provides a list of supported wallets |

## Events

| Event                       | Type    | Description                                      |
|-----------------------------|---------|--------------------------------------------------|
| `CardanoConnectWallet`      | `event` | fired when a user selects a wallet and the payload contains:<br />- address: selected wallet address<br />- name: selected wallet name<br />- icon: selected wallet icon<br />- api: Cardano API object with following properties:<br />- getNetworkId<br />- getBalance<br />- getUtxos<br />- getUsedAddresses<br />- getUnusedAddresses<br />- getRewardAddresses<br />- getChangeAddress<br />- signData<br />- signTx<br />- submitTx<br />from: https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030<br />-serializer: cardano-serialization-lib-browser obj |
| `CardanoConnectWalletError` | `event` | when an enable event does not complete successfully:<br />- code: error code<br />- info: error info<br />- name: selected wallet name<br />- icon: selected wallet icon |
| `CardanoConnectWalletError` | `event` | fired when no supported wallet is installed:<br />- code: 404<br />- info: NO_SUPPORTED_WALLET_INSTALLED |
| `CardanoConnectWalletList` | `event` | f json prop is set to "true" it will return a list of supported Cardano wallets that look like:<br />{display: (string) Wallet display name, ex: Eternl<br/>id: (string) Wallet display name, ex: eternl (internal use only)<br/>installed: (boolean) if true, it was found as a property of the Cardano object in the browser<br/>icon: (string) base64 image string to show the wallet icon/logo<br/>} |

## Listens

| Event                       | Type    | Description                                      |
|-----------------------------|---------|--------------------------------------------------|
| `CardanoConnectWalletSelected` | `event` | if json prop is set to "true", will listen for the selected wallet will then fire `CardanoConnectWallet` event. |
|

## CSS Custom Properties

| Property                 | Description                                      |
|--------------------------|--------------------------------------------------|
| `--btn-bg-color`         | modifies the background color of button          |
| `--btn-hover-bg-color`   | modifies the background color of button when hovered over |
| `--btn-hover-text-color` | modifies the text color of the button when hovered over<br /><br />https://github.com/Tastenkunst/ccvault-cip-0030-test/blob/main/src/dapp/components/initialApi.vue |
| `--btn-text-color`       | modifies the text color of button                |
