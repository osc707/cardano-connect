# cardano-connect

This component provides a button and a list of browser based Cardano wallets.
A wallet when clicked, will connect it with your site, return the name,
icon, address and Cardano API object to interact with.

## Attributes

| Attribute | Type     | Description                                      |
|-----------|----------|--------------------------------------------------|
| `text`    | `String` | Text used on the button, default is "Connect wallet" |

## Events

| Event                       | Type    | Description                                      |
|-----------------------------|---------|--------------------------------------------------|
| `CardanoConnectWallet`      | `event` | fired when a user selects a wallet and the payload contains:<br />- address: selected wallet address<br />- name: selected wallet name<br />- icon: selected wallet icon<br />- api: Cardano API object with following properties:<br />- getNetworkId<br />- getBalance<br />- getUtxos<br />- getUsedAddresses<br />- getUnusedAddresses<br />- getRewardAddresses<br />- getChangeAddress<br />- signData<br />- signTx<br />- submitTx<br />from: https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030<br />-serializer: cardano-serialization-lib-browser obj |
| `CardanoConnectWalletError` | `event` | when an enable event does not complete sucessfully:<br />- code: error code<br />- info: error info<br />- name: selected wallet name<br />- icon: selected wallet icon |

## CSS Custom Properties

| Property                 | Description                                      |
|--------------------------|--------------------------------------------------|
| `--btn-bg-color`         | modifies the background color of button          |
| `--btn-hover-bg-color`   | modifies the background color of button when hovered over |
| `--btn-hover-text-color` | modifies the text color of the button when hovered over<br /><br />https://github.com/Tastenkunst/ccvault-cip-0030-test/blob/main/src/dapp/components/initialApi.vue |
| `--btn-text-color`       | modifies the text color of button                |
