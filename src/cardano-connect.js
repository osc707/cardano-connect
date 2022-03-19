const template = document.createElement('template');
template.innerHTML = `
  <style>
    .hidden {
      display: none;
    }

    ul.cardano-wallet-list {
      font-family: Arial, Helvetica, Tacoma, san-serif;
      font-size: .85rem;
      position: absolute;
      z-index: 9998;
      border: 1px solid #efefef;
      border-radius: 5px;
      background-color: #fff;
      text-align: left;
      width: 150px;
      box-shadow: 5px 5px 10px 1px #efefef;
    }

    ul.cardano-wallet-list, ul.cardano-wallet-list li {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    ul.cardano-wallet-list li {
      border-bottom: 1px solid #efefef;
      cursor: pointer;
      padding: 6px;
    }

    ul.cardano-wallet-list li:hover {
      background-color: #efefef;
    }

    ul.cardano-wallet-list li:last-child {
      border-bottom: none;
    }

    div.cardano-wallet-loading {
      background-color: #fff;
      position: absolute;
      width: 150px;
      padding: 16px 24px;
      z-index: 9999;
    }

    .image {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin: 0px 8px 0px 0px;
      vertical-align: bottom;
    }

    .loadingImage {
      display: block;
      width: 64px;
      height: 64px;
    }

    .button, .button:hover {
      background-color: var(--btn-bg-color, #efefef);
      color: var(--btn-text-color, black);
      border: none;
      border-radius: 5px;
      padding: 8px;
      cursor: pointer;
    }

    .button:hover {
      background-color: var(--btn-hover-bg-color, #fafafa);
      color: var(--btn-hover-text-color, black);
    }
  </style>
  <button id="cardano-connect-button" class="button" tabIndex="1"></button>
  <ul id="cardano-connect-wallets" class="hidden cardano-wallet-list"></ul>
  <div id="cardano-connect-loading" class="hidden cardano-wallet-loading"></div>
`;

/**
 * This component provies a button, a list of browser based Cardano wallets.
 * A wallet when clicked, will connect it with your site, return the name,
 * icon, balance and Cardano API object to interact with.
 * 
 * @element cardano-connect
 * 
 * @fires {event} CardanoConnectWallet - fired when a user selects a wallet and the payload contains:
 *   - balance: selected wallet balance
 *   - name: selected wallet name
 *   - icon: selected wallet icon
 *   - api: Cardano API object with following properties:
 *     - getNetworkId
 *     - getBalance
 *     - getUtxos
 *     - getUsedAddresses
 *     - getUnusedAddresses
 *     - getRewardAddresses
 *     - getChangeAddress
 *     - signData
 *     - signTx
 *     - submitTx
 *     from: https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030
 * 
 * @fires {event} CardanoConnectWalletError - when an enable event does not complete sucessfully:
 *   - code: error code
 *   - info: error info
 *   - name: selected wallet name
 *   - icon: selected wallet icon
 * 
 * @attr {String} text - Text used on the button, default is "Connect wallet"
 * 
 * @cssprop --btn-bg-color - modifies the background color of button
 * @cssprop --btn-text-color - modifies the text color of button
 * @cssprop --btn-hover-bg-color - modifies the background color of button when hovered over
 * @cssprop --btn-hover-text-color - modifies the text color of the button when hovered over
 * 
 * https://github.com/Tastenkunst/ccvault-cip-0030-test/blob/main/src/dapp/components/initialApi.vue
 */
class CardanoConnect extends HTMLElement {
  #EVENT = 'CardanoConnectWallet';
  #EVENT_ERROR = 'CardanoConnectWalletError';
  #WALLETS_ID = 'cardano-connect-wallets';
  #BUTTON_ID = 'cardano-connect-button';
  #LOADING_ID = 'cardano-connect-loading';
  // #ADALITE = 'Adalite';
  #CCVAULT = 'CCVault';
  #NAMI = 'Nami';
  #YOROI = 'Yoroi';
  #wallets = [
    // Not currently supported
    // { display: this.#ADALITE, id: this.#ADALITE.toLowerCase() },
    { 
      display: this.#CCVAULT, 
      id: this.#CCVAULT.toLowerCase(),
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAANrElEQVRogc2af7BdVXXHP999zrk3AQuoULFSMZoK5EEQUqVR6wQHp6JA7bTvMa21nQ5TtGOjBSuFvJCcEBIYSCnSdhxs+0frTKfmaWWMxd+aSrBWjRAkiaAQdSoMAtKAQN69Z+9v/9jn3HfzkmCN6UzXzHnnvHvP3ee71l57re9a+4gjInWAOr3+rOvPxOluIAFqjwQEweNJxdI77/qLh8AC+Ug8uTwSg4zLIWEZKI70046wAhWQEDibHjJuAZaVjuTDWglHYpAVK/I4RXKobHq2Kpv2mnyNj4n5vsnJmSPyXPg5FZic3FwAbN1aNwClm2d6yfRs91rwnQK9ZA0rPwUwMzMVwep+//OIfvotBweeQWR5y5INryrxGyXeJPRmGWtufFvI0Bhus/TFpuELt3971f2HGu//UIERLp+/eGW/1z/xHYhLisQ5ASRDaEPM+MAGG5SUQ1KCgcW/R3zrlp2rPzanxGT6WaPTIVyoPuDzPN0yyBctuXay1z/x7tL8XT/ya32jfqJZYDcLkrUg2f1kL0imPas9NwsSTd/0KvOmyvro2yY2fPWiiQ3n5hmQ6wOebR0MTyfPOQPd1Hbn85Zdf+zR+9KthX1xaSjtpgAVJhTZ+hJYNhob22BLJFACJ0EUsRFqUBEFSXzgtp3Dy6FO85/7XBj3U2DZslurhc3j/2rxhTvvXnUzwKXLbq0+tP2dwwvP2HhqkbylNIsruymNSlMUxoVNaAeTkQ7iBsaysMmhNgqafMRGCkMRGnFniPrNj3971eMd+GXLLq0WNi+7xujEO3dc9Ufzk6DGLf36pRvfQ+ADMhSJr1fW6s/de9VnLzhtw9ml+HwFz6+Sh5UpswJ20YIOyK2LW7Y0lrYsNc4zIUPolIlAI2ko3IhmEFQ14v5nEys+s3v64TcuvfZ3I8W6JH7FGMkX3HH39L+Nz8xoBs45fcOLqoJ7RTg+wLC0q9JQmI/0k19bwi/3MviqMi5twhzwGOyy4w55UDfAEOiDQqsAhpQkG0LCSsJDiaHQUAyHQVVj7hmUfG+ILmoEUZpNom98z4vvvuvsGWZGbjXKxFVgDQrHyzTBrgoTCztU1sUl0EuOlal6I/BSgBSy+5TCln2H0KdS8l2h9KM2g2AWGE7E4RyL8y2WBUOCKCnIqIu0gork6KClZdJSy9EIQ9/QWCx96FVnruTumZv3c6E3nHndWQlvF1JhXGKqZFWWe3bsJYeeCePgi2z1ImCEZqR4/Y3frb/5XAsO4IpXrDs3WlcjnZuAKKUEIckeSgyEBoE0CPIAhWGwhpIbyQmCSY8paMkdd616dDQDtv+WIMnMBtwvDAVyaau0i9JQ5ajTgW8Ku5T9VLAvuXHPmpnO2yfJNGFixS4B7Ny6ZLTgZpiKNzyw9kvAl973imsuDeYG4FhJxlKJbUSylBJKwUqWc/QyFvuscLyjbwbePudC8g6Z5cHqBxODTWEVBbi0qGxK263bxGCXwX4smfNu3LN2xySbiwl2eS3yDJuZYirObN0/Aq1jnSaoy5pMO6qYPptCsVLmWLAtyVkJklFCROMig09JIqEFsgeI+/ZbA3fsmP6T1y299h9Lh+sCrCgQhd2UdmhjvEOO86mwi2APSFxw0/fW7Mhhdmo4QR0yD83R4dqTpl8SetXR9mCv9uiRdg2n+mX1cY20OqHLMAE5GYINljBQGiImWoo4RSkEg/BHLaa37ZijIW0UygUJwG+cseH3+ol1fbO4n6Cf3PTsorBU2LGEQskrN+1Z8zddjtjM5mKKqVifUD+vWqh3Gy4O8FKgBzxreMBwaxQlsD5JL06IJKeIQpQdJcW8Jogys0HMijQbFGbFg7PiXZ+9d/pzsD93GktkdYC1BvnCZfVRC5+p3rcg+YoF5nlVwgUMC7sXnL72lw+uPaf7VQd+w8n12VgfCbBYKA/cFgM5fLpNEiJBk0QRkVrwRKwMXjQyQ4nZQNwnFQPxhdt2TZ+Xge9yZ+x5CmQZ1+4dp6xfdFRifWXeXiBKG9lv3/Tgmn/u/L6mTvXL6lN7Sf8Z0DHBDETOb0IYAzgh2kynKIeE3FpbkWz1ToGIGQpmg9K+oDAQTw+czvrk7qu/Mz8TH0CSRlydzcWH77t6z63fufr3FfwG2d/AfqJJ6fYcUSZT3VqiSvqHDN6DgHvBCoWlYLdnFQGHYAdBCDkRK2AFi8A4FTFChAxOwUTB0aEIr8wG3r8YOgTLk2eYijV1qKnDX9+/5o7jHojLIV70w+/tfCq7Th5o/UvrCwSvlWkEPVnOgKwMwgrk8CtQCzSfPZ651YKfc41MUWwBIXHqwZA+Z03cWXiSzUXNVMODbJt/T4C3Zp/PISUnNmfuIDJ3aJ1JHUiJOdrhFvxcETGmhEetDekkAGYOeP5Pl5k2NI5z9Sk6mqtFc1bMH2TLimDNgd4fWF7Z4//Pu27vH30V7GMOhu1nqolr1h5Ak4WK0SUwT5kD5LBq2PzDg2L9XypgZevPrf7N5II84Ye7m9o/7sKmlc/jqDtWOv+z+dc+4Cv95LAUqFfUZVvqpfcuWvWi+SWf7C8aZ8/HMiJJzqnftBSgPbwfwHy0C0UHgB+7Bywe5iBySAUmWwvXW+tm5eKNJ1z28vV/X2rBF/eetLcPMMVkAnhi8JOZBHuSKNsEpQw2x/5cxAvLHZCc0NrrOZAeUYkOfFfh56mN97fAnluBLnTOMBUnmSzetXj9ZRB3WVyCtKToHfu6PM5M2MzmYtMjm55GvLu1dpnwMMlObVLKs+HUKtckZMukFltWQuOWHl0n4SSVuRYI9wNMzOzabx2OKZAbTTV1qqnTxaeuv+CoU878pqWbEjo+SfsMSGElwAS7PNXmiunvr/2U8R+2rLFKUkiQEgxzEa8QpTKhMs8QjQURKWGn8VlpZyu7HqnlDNs/ce/0PRnf2gMV6FomMzNT8fyJjUsumthwmxW2JGlpFI0zY+y3A170/pfXb6mpU72iLluFw/QP6n9qCp0dxW0R723kIspVI4eIH0/yBxPpQ6OZsmKeGcmZTnduQwJinoGu+C9WLKlP7Fov4x29USx4/RnXPb8SV/Wc/qxnVb3k1LPdTxT9ZJdGBYqFXRT2f6G0bNMD9Y/qFXVZb62b1vUSwNqXr31p2eiVmKMoeDIW7KofqH8EcPXJ1yxHbExiRdudSAmH/XmQmA0wCDArpUFQGMhPDtGGR+Lg5l276sF+Cvz6qzb+sczaYL2kbco2PVP0Euob91PubxZj1Viwv87TT5676ZFNT3e0uotQ9RhbHF9b499defK630qF/irByVFKSQqZTpuBlOl0wANJAzkNg0KDiKTdlqe37Vj9cRiVlHo/4iUJZhP0IpTRcpTdYIIgZLpgWSXQIL06HH3sV65YtH7qhu3vvA9gJ0tymyYz1dHs7mSJd85TaJ+8p0DJozALSabJHQoamcxS8xpKkJIYWuE0238KzCkAvtxmC6iKOeU5yjS0nQdZbe/TuSOiErtBLDXe/v5F19R+5skPbnpk6ukO4DzKMpKVi686oe+FV9j8ubPbpAQhym7BqxGpkWikELGj5LxW6GMPFcLlB66BM6/7BOLCYJrSLkuTKjv1TFkl6JnUs0OV7BIYq4+LzCz9A8TmZH9aLr771Gzz6C+9ksEzDz+z0PEXftEpnQpcaOt3HPTCbHHFBEWScxMpSAMRB1IxDGIoN0OpaIQaqUmixL5l245V7z1AgTeccc0ZKZTfFCrb6quqbMrE7p5ZVJkFlYmVXcxTIsmkQNfYMpgfA08ot9R7wAuRjpmL72oSFLljPWf5oWgGUjkUPx4G9g6lRbn9qEG2oR8py8HpW7fXj3W4R2H0y99a8y3glhyfqSLsTWbVJ3dOL4nikoFgKIphbgFqmKspR1lRFI2UGqlpUIrSC5L0iiidkqRFUTqmgdhITSOlCGWUaeR2kaKBGLbgBwP0NvWHpzfWByI0CXrOjfH1W7fXjx0kjOYybflE/YKi7H0D2OYwuPLOu+qHuhsvnLj2t0vrX0pTVvaw7Pqj4NA1d9vG7jxa0zFAdT3RtqFF7Pwd4jCoauCxxr5wy+7VXx15xunrT0uhuEXi2Dt2rHrN/DUVRmNj/cfO+sdlOXjNth2r/uDOu+qHsqY5Q2/ZufpjMXj5UNw3G1QNgjQIDGeFB0EMJHIHzTRyaI+ikUPM1wyDPAqRwrNiOCuF2aBqKLbN2r+6Zffqr44/98v3Xr172z2r3jQ7y/lzxp6TefS8K5gtWKfx6r8r9pefdNPCE457dn2ReE8BXQO4yWUjIeQ94Y5Fy5kdKGWa7SRS7kZQxOyu/x0DGz9x7/SN48+ZwzTX8jnY/vJB6otDb0KPD/7W09efVlqXBWsywHEBCN0WkxnjlWBkZyUY22Z6OMofTiW3fHLH6h/CiEgeYjf24LgOo0CyJidnQqfIW5bUJxah99ZgnxfMcsHJY2ugJfsjhnl/Cv4K8Jmn++WnP7/9yr3zDfOzymFXeAejDW+euO7Vhfy1vGPUNRbyqwbGTzj6rNt3r/5+d//hbuyNy2HvE3e0G6zJJXUPoAnaNxAMBLPtee5Qeka9WchbWWB17PJwMfxcCsyJPLGLBqApYtHutjBsgefr3PcP1aAA2L790ub/1csedXtuVFjqXlSZJ8ZNqI4I6HE54m+reH7TpxUd9mp7bvkfMy1GrWwy9u0AAAAASUVORK5CYII=',
    },
    { 
      display: this.#NAMI, 
      id: this.#NAMI.toLowerCase(),
      icon: 'data:image/png;base64,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',
    },
    {
      display: this.#YOROI,
      id: this.#YOROI.toLowerCase(),
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAJA0lEQVRoge1ZaXRV1Rnd+9wkmIAgIqAQCEMgJAHKDApCEAyE4QWIT7CrC1osoaKAAq0ttVUKyFAZ2qyqFFmiVmRoDBASCEMILYSZkISEmECYxJZVi7UCLZB3vv547yU3L5f7XiDWP+z8ueutc75v7/Odb7g3wH3cxz2B0aPyRkDxPYKPEbwiZIUCQTIYwA1AzSvcHL32uyA3cOL17kGiPiLYHORNQoEEAT5EMIzEfAJAp9EnBimqDID1SQKg+8/7TH5YkBY96f9JPu4H12YSXGnm42bv5aXm7PrAWMbKHW+Iis7Ln0nBckCB9BEBngNlbkFazPpvk/iTz13tqlTQ7wjGeQnDzENxLbV+ffdHoRcBgL4GYhNPDhNgFaEiqpQDhAJBCPirws2dFnw75P+VROLPvsQ9p68pmJv9p7Al5j01BABAjLMohDdvLRUYMy0iASGKIZhYuDn6eF0Q7/vclebBCF4PIM50bc0idiltTMleF3rBd6+lAC+iRxeMUQppVpHwOJqVnxa14l7IPz7hylgFrgZVE/NBmUTM3fdxw0V32m8rAACiHPlRBuVVwvhR9cR2iwH4qaFk3onUTgW1Iu689DBU8CKQybRMUmaDfPOvHz+0x86OXwFexDgKZpFYRihTJADQExGFsSdTozYHSL6PppFJskmNJCVBwTv71z8yLRBbAQsAgOix+Z2V5kpCDTE7NJW59fpmvWmFGRFfWe13OsU4j8spJF4wl2rv6QMsUTRmHPikya5AOdVKgBexjlOvkZhfGXKgKhLkP0QwOT+t4zbznt7jLvYWJe+TjDURNov4Y7huPm3TJrpqw0VZ/RiZcKih3aairZ0XiDABog8IBAIAcD+JSFMS6d3HlaV41/cYV75QK9cRQGJFBBoaEPHs0aUQjD+44dGpduQTEqReXJwE+f5uGYEOIw//HkD9soy+z9sJAYDOiac+ADGxRk6QELDEAP8DsrtFaQTBzAiEO/yd+oAJX75IpSYYXzQenJPDigAEHFoB8GWAWRKkZ53Z0q/YzkGXxKLvg3gL4GOWo4hvkoLfQPCLY6lt/mBnt+foL8IeCAtZDIXpBEv3f9IkyneN5RUS6K/cF0OGqQpVFDXy6Mt2jgq3xK5zBaOjQDaICCCV1wmmq+V+Fsky9O0Yf+T7P/u3wSFhRrFQT3fb0+VW62rcKQCAhgEKQHjuN1ZEjToSC8W3Ptva+zOrLcWbYq8BmNAl8VSekLMI1UzcpwG67VwHuDQvtd1v7IjHOItCGrDxHBexkJX5BVAYYrX+DhHAw74nqAU/Fo3ijqOPjbEjULil85LbVDEi+jBEuymIFFS4GJ2X2t6WfA/npcgGqtFpQhaKJ4oQNw+BtLLaY5kD7UfmPiFa1pGMqN7eAUUFIVN0RaOfntne4aYdoS5jilJAFVyYFv0Tu3UA0Mt5IZlgCsEQi2FOC/jSoQ3N3wlIAADgDVHtDue+SeJVesZrnxnlc4FMLd3WO9MfOTt0H1ceYSisAdQQn+nT628fg4KmHF7XrMxqv99G1i4hdzIp8wgV7hsJgFDkrObf/DslJ2dwha0hS/JlDlKtBxhqUWJB8u3DG8NftLMRUCeOTMisJ2z0AaHGW0QCijhLBCUWp3crCsRe58QzrYINvVrAYb5DHEFAeFagRx1PbVviz1atRon2I3OTKVxOsr5vJNzO8crp9J4r7Ww87rwUer3iRjaBftY9Q61+8EGZkbO27X8D4VTrWah9/IFmDFJvk0yqHgnPeE0e1NCTS9N7WZ6e0ylGya2SGCqkEGqQScQlQ9Tzx9LaBTzI3ZUALyITDi6Gcic44I0EQHdEKihMPL2tu22Cdx1bsoDgL0l1wLhdP/54eosbteVhKaDNiL2Pns8c/Hd/m9uNyO2iyLWE6mGOhOmjQAYfCJngaXLWIhwlUQVbO1k2R1/EOItCijfF3vIrIDx+9yoFNL/Y6GoSNj3rd7yNHHF4GYlZnqrksay8t/syFJJPb7GPhh16PlMer2BMr99AO31zw7ITQ8vXAiS2/vqRstZPZw/x5+BMZt/ZolxxgM7X4mn/VR20JTQyoh35a8OduaG1Jd8jqXwVwCxA+lsltrUAyjWBhkC3BWV3q/g98/2KSH9iX1lGv26A/lREwz1Fae8oB4ie1PBmWFGnsSc7BkK8W9LZEd2TzuYBkiwicEFOW62znoVEgkUq50gQeK318OystvF7BvpzXJbRL0mE47Xoqx5jlXZEpK3hQnGs4+QSP2YgWncR0d2885gSCXyY09D1AanmHFriXcS+iPjsyf6cn8nss5HKiNJap7vtVEVCixgC/CzGkb8/1lEUeScb+WkdlpCu3kL5yv0WJy0DFkAXVlH0TvG8+lVdA0CINRHD9mZGxO9rayeiNL3Xl2WZfR2i8RIgV1Hz3aC/oKIoxlE4+0428lI7HaNCFCivCzDdkqsdiRZDs35OyiJPg/JWFc+zuiXQUy5mPfWhnQ0AiEw40ZRGxXYF9jRVJ/Nb2p7rXz846nxOYN03YAEA0GLIjqEk5oJqcOWQBZjL5Ic0XL8+lzmkxmc/X3QcffQVCpebD8Mk4pKQvy3e3CXFn51aCfCi5dDtq0AjmTUiAQDqmjI48lzmoL/4F3GkN4TvkyrWQgQI5rJCRhVmdLX8tuQL6zJqgcu7E6ZSXEkict5UGr2fVBqIln0Rw3OWwrnRsLNTmt7naGnoue9B5F2pnhPevlEaEnZLB8qr1rNQz57Hgq80/ue7UGqyRSRAslQgP7ywI+6gP1tRjqP9IdxFqFACJwg1MdCR/K4FeBEenzUD4BxCtarKCVTmhoKaXd5vwEq8QdvTjHUcj7yt5ZnSbb0W3w2PuxYAAE3j9jaoF3J7C6GeMr+YeO+zAoupZfjZnYMu3YsfO9yTAC9aPr1zrqJaWO06VVWpG4CacW7HgDV14csXdSIAAFoMz44yxPUeRQ24w7+IchTktbPbBx6oK59AHQrwIjx+9yoCyfTJCU+53Fy+/cmxdekv4DIaKD7fOXSqaOmqtb5QNVZrgDKpvO+ApLr2V+cR8KJN3N4HKkJcH5HsoGi8EEhZvY/7+A7wPz4tjRzAvquXAAAAAElFTkSuQmCC'
    }
  ];
  #buttonText = '';
  #loadingGif = 'data:image/gif;base64,R0lGODlhQABAALMAAAQCBHx+fKyqrLy+vAwODJyenMTGxAQGBISChLSytMzKzP///wAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQIBgAAACwAAAAAQABAAAAE/nDJSau9OOvNu/9gaCWCaJ5UAAAB6oLIurZvnakAQcx2T8U5g2HH8vVwBINkyDO6gEkKs+g0IZWVKa36gWItWq7nqgmLNV6O+Wwhd9ZsSfoDP7tB9eo9lPftRX01QCsFLgUyVH4rRACFJoeLTTZekI0ilQWBIW6YIJ0Lmh5zEp8cpaBEWyJ/C6cYrqiSMItfFbAUt7GJY7QaublLqV29G7DAE6ETrK8yjqTNHsmjHZ/HYMIYy8XN1hd9056IhCd1CcQnlZYoUyUTAucm7zLt5ET0Etoc8oj3eNgV+TLsEzAQ0L828PTNk1CQzsELASk0ZLjwzcNsCS9MdFexzMUbYhkldqyw8ZqsDtpKkhwp5SMHViotqEymYU9MjSNpbnBzE0NDnS9p9RQ4DyjKSCv6fdjnEgWOpC727VIEQKkIeaqcDKjlQsGAOGDDih1LtqzZs2jTql3Ltq3bt3Djyp1Ll2wEACH5BAgGAAAALAAAAABAAEAAAAT+cMlJq7046827/2BoJYJonlQAAAHqgsi6tm+dqQBBzHZPxTmDYcfy9XAEg2TIM7qASQqz6DQhlZUprfqBYi1arueqCYs1Xo75bCF31mxJ+gM/u0H16j2U9+1FfTVAKwUuBTJUfitEAIUmh4tNNl6QjSKVBYEhbpggnQuaHnMSnxyloERbIn8LpxiuqJIwi18VsBS3sYljtBq5uUupXb0bsMAToROsrzKOpM0eyaMdn8dgwhjLxc3WF33TnoiEJ3UJxCeVlihTJRMC5ybvMu3kRPQS2hzyiPd42BX5MuwTMBDQvzbw9M2TUJDOwQsBKTRkuPDNw2wJL0x0V7HMxRtiGSV2rLDxmqwO2kqSHCnlIwdWKi2oTKZhT0yNI2lucHMTQ0OdL2n1FDgPKMpIK/p92OcSBY6kLvbtUgRAqQh5qpwMqOVCwYA4YMOKHUu2rNmzaNOqXcu2rdu3cOPKnUuXbAQAIfkECAYAAAAsAAAAAEAAQAAABP5wyUmrvTjrzbv/YGglgmieVAAAAeqCyLq2b52pAEHMdk/FOYNhx/L1cASDZMgzuoBJCrPoNCGVlSmt+oFiLVqu56oJizVejvlsIXfWbEn6Az+7QfXqPZT37UV9NUArBS4FMlR+K0QAhSaHi002XpCNIpUFgSFumCCdC5oecxKfHKWgRFsifwunGK6okjCLXxWwFLexiWO0Grm5S6ldvRuwwBOhE6yvMo6kzR7Jox2fx2DCGMvFzdYXfdOeiIQndQnEJ5WWKFMlEwLnJu8y7eRE9BLaHPKI93jYFfky7BMwENC/NvD0zZNQkM7BCwEpNGS48M3DbAkvTHRXsczFG2IZJXassPGarA7aSpIcKeUjB1YqLahMpmFPTI0jaW5wcxNDQ50vafUUOA8oykgr+n3Y5xIFjqQu9u1SBECpCHmqnAyo5ULBgDhgw4odS7as2bNo06pdy7at27dw48qdS5dsBAAh+QQIBgAAACwAAAAAQABAAIQEAgSEgoTExsRMTkysqqw0NjSUlpR0cnQMDgz8/vy0trSMjozU0tR8fnwEBgSEhoTMysxcWly0srScnpx0dnQUFhS8vrz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF/uAljmRpnmiqrmzrvnBsSoRs32QDAA3uw4HdrvcrpnQABGJobJKCSYFgyXM2kQiBaMq0+qBZErfqtWG1pTGx/AKjTWq266yKy1Vulv1uorf2fCJ5L4B3fjCFZYcxiU6LMmMWbFA7Ez4TQhCKO1QAljaYOwMJXm6hnjKnOwekV5xop58upw0Vq60/gyKxs0KWELYArD+PF7wrxxfAtzi6Jckn0MrBwzLFJNIj2dPMQK8s2dsiy8K4LNfRvtjqKuTVK87g7OIl7uYn6Cqx9Cb2KfEvVFWK4W/GNxyqZMEoSILAwRv8VpCjgO9hDIc7IvwIhQBFvhQYhRjAMSbAEYssk0IecLBjJCQqazyiBCmkhgSWAFwSgtnio4iQNUTcbLmzS8+ZDWuWGJrzD08Y6ICeYKoTRaNzM6WioJri6tEoSXcETcEVzlMcfrSuKDvCK9RXalmwdRsDi1IYXOlaEwJgLF6cB85aQeI3BlOjZSy8uaEAZ8xAOBQUWAC5suXLmDNr3sy5s+fPoEOLHk26tOnTqFmEAAAh+QQIBgAAACwAAAAAQABAAIQEAgSEgoTExsSkoqRsbmwMDgy0srT8/vzU0tQMCgyUkpSsqqwUFhS8vrwEBgTMysykpqR8fnwUEhS0trTc2tycnpz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF/qAljmRpnmiqrmzrvnBsGots32QEABHuw4HdrvcrpnSAQmFobJKCSYFgyXM2kQWBaMq0+qBZErfqtWG1pTGx/AKjTWq266yKy1Vulv1uorf2fCJ5L4B3fjCFZYcxiU5ICW82Agk7DWxQOxU+EA47D4o7lJk3EEIQZW4VQpoxnDunXn6qoy8Dpqg7YSOzAKwsvLBWiyK8vim8AAQHVoMmxSq8VMpXuZHOqyjFCBI70z/Nx9glzxYI0ss4w+G0xOIi293oMuC/4uQk5vEy6vWZ9yXwkslrQe8FMnYn8gl0YaCaD2TGUAT0tmKBQxz/VCikqIJfi4wrJg48chEGSBYboUei8JjNXQyRLViWsIhQhsKIJKOwoLlDgY8xNeaUPMGzEwCfkqisEaqTqKkJRpEiUmpmqAiesKD2nNqlatOrt0ZMECV1RSMYfrCa0HpUD9UiZ9SeYFsWzlsjj4wGm0sWxdl0QgDsRUHXbldhr1wUHvG3SINPLxY3DkQ46mTKlUMdxgyDLRnONrQuBS2DgjXSqFOrXs26tevXsGPLnk27NowQACH5BAgGAAAALAAAAABAAEAAhAQCBISChMTGxKSipGxubAwODLSytPz+/NTS1AwKDJSSlKyqrBQWFLy+vAQGBMzKzKSmpHx+fBQSFLS2tNTW1JyenP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAX+oCWOZGmeaKqubOu+cGwai2zfZAQAEe7Dgd2u9yumdIBCYWhskoJJgWDJczaRBYFoyrT6oFkSt+q1YbWlMbH8AqNNarbrrIrLVW6W/W6it/Z8InkvgHd+MIVlhzGJTkgJbzYCCTsNbFA7FT4QDjsPijuUmTcQQhBlbhVCmjGcO6defqqjL6WvqDthI7MArCyuALBWiyK8vim2wbhRKMYqwMKOuZEmzifJ0U2DKtYkvNlGxCndFrwOE17bLda8O+fSzDHGxgru6EXqMO209QDvPgam+Wh3rN+/GwsE4iAnwuC9G+JcMBzh0EfEFRNJVMRxsdkqFhshKmSR8URIMyOfx318cVJGx3IrYbSMcbEkSHsWU4oYENOGQQo544lImAuBDwGdAFBzqZCoEAlGJVFZEzSLUwgEdkCV0UgkgARJTx3ICmAroamxhCgTMVZrVD1oQa0d0bbs2xRdjTT4ZKKuWRR5A/m9KyZuoBSD4Rg+jJjsXwuBGdN1HDWy5MluLV/GXHbxZhZ1u3x+UZfqaBcHKtQ4zbq169ewY8ueLTsEACH5BAgGAAAALAAAAABAAEAAhAQCBISChMTGxExOTKyqrDQ2NJSWlHRydAwODPz+/LS2tIyOjNTS1Hx+fAQGBISGhMzKzFxaXLSytJyenHR2dBQWFLy+vP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAX+4CWOZGmeaKqubOu+cGxKhGzfZAMADe7Dgd2u9yumdAAEYmhskoJJgWDJczaRCIFoyrT6oFkSt+q1YbWlMbH8AqNNarbrrIrLVW6W/W6it/Z8InkvgHd+MIVlhzGJTosyYxZsUDsTPgRCEIo7VACWNpg7NV5uE0KfMKEAo1Z+ppWpQqxOgyKvni6qs1ecbyO3qCm6ZbUlwCrDXo/GpyjJVsUoxyXPjr0u0yLVTdEr09tGyyzAt7tG3dhCQgdlEtc4tzsOCl6hYfBCEfL0re8yxwb2KfP3IltAAPMGRoGRTcTBhP0Wtmg44iE/axJVUCRhUeE9ac1UdIz4kRksFiORMZa0FbJFSl4ZL2xc8TLcu5koBZIUgNOlTpVC1tw4sKPAJnUVNN0Ys4ANkgE7ktqAQEWoFwsCEhAFIBVR1UAitEZV2oJqF7AXxHIlq8IsGbRht3ZN0Qis2rkm3FqFG3fsCb18Udxle6Fu4LRyyQI+nGLwhcWMG8ud8DXyCrVBLbfAvFez4AMIHngeTbq0ac0hAAAh+QQIBgAAACwAAAAAQABAAAAE/nDJSau9OOvNu/9gaCWCaJ5UAAAB6oLIurZvnakAQcx2T8U5g2HH8vVwBINkyDO6gEkKs+g0IZWVKa36gWItWq7nqgmLNV6O+Wwhd9ZsSfoDP7tB9eo9lPftRVMDXEArBS4CMgp6K0QAhiaIKyVOXgUyjyCRAJNGbpaFmTKcPnMSn44emqNHjF8Tp5gZqlWlFbAas05/tpcYuUa1GLcVv36tHsMSxT3BG8PLNrscsNA1zcgyolUJxyinm1yRUd7Zq8ZBJ9+SYtLOl9XR3digC/A17RbJ9dpc+K+9xPgtQpdBHwV7L9oZDLiun7x/9HAJ1PVwoa+JnbpZlIXxXJKNYRIbDmwUK5RIigBPaFLkkOCJQHYe4iGyhZ3MDgpoxpHgD4zOnTxvYsjZBGhQlxn67PRHlIrRCu2UPt3VtObTNg+lXj06rupWDle0fp2A5OdYsNmsntWAQ+1aXAneyp0rIgIAIfkECAYAAAAsAAAAAEAAQAAABP5wyUmrvTjrzbv/YGglgmieVAAAAeqCyLq2b52pAEHMdk/FOYNhx/L1cASDZMgzuoBJCrPoNCGVlSmt+oFiLVqu56oJizVejvlsIXfWbEn6Az+7QfXqPZT37UVTA1xAKwUuAjIKeitEAIYmiCslTl4FMo8gkQCTRm6WhZkynD5zEp+OHpqjR4xfE6eYGapVpRWwGrNOf7aXGLlGtRi3Fb9+rR7DEsU9wRvDyza7HLDQNc3IMqJVCccop5tckVHe2avGQSffkmLSzpfV0d3YoAvwNe0WyfXaXPivvcT4LUKXQR8Fey/aGQy4rp+8f/RwCdT1cKGviZ26WZSF8VySjWESGw5sFCuUSIoAT2hS5JDgiUB2HuIhsoWdzA4KaMaR4A+Mzp08b2LI2QRoUJcZ+uz0R5SK0QrtlD7d1bTm0zYPpV49Oq7qVg5XtH6dgOTnWLDZrJ7VgEPtWlwJ3sqdKyICACH5BAgGAAAALAAAAABAAEAAAAT+cMlJq7046827/2BoJYJonlQAAAHqgsi6tm+dqQBBzHZPxTmDYcfy9XAEg2TIM7qASQqz6DQhlZUprfqBYi1arueqCYs1Xo75bCF31mxJ+gM/u0H16j2U9+1FUwNcQCsFLgIyCnorRACGJogrJU5eBTKPIJEAk0ZuloWZMpw+cxKfjh6ao0eMXxOnmBmqVaUVsBqzTn+2lxi5RrUYtxW/fq0ewxLFPcEbw8s2uxyw0DXNyDKiVQnHKKebXJFR3tmrxkEn35Ji0s6X1dHd2KAL8DXtFsn12lz4r73E+C1Cl0EfBXsv2hkMuK6fvH/0cAnU9XChr4mdulmUhfFcko1hEhsObBQrlEiKAE9oUuSQ4IlAdh7iIbKFncwOCmjGkeAPjM6dPG9iyNkEaFCXGfrs9EeUitEK7ZQ+3dW05tM2D6VePTqu6lYOV7R+nYDk51iw2aye1YBD7VpcCd7KnSsiAgAh+QQIBgAAACwAAAAAQABAAIQEAgSEgoTExsRMTkysqqyUlpQ0NjR0cnQMDgz8/vy0trSMjozU0tScnpx8fnwEBgSEhoTMysxcWly0srScmpx0dnQUFhS8vrz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAF/iAmjmRpnmiqrmzrvnAsz3Rt32tSIQHuq4kDYOj4GUnBobJ4/CUBFgqC2MQ9LRGMYApgVmfXrGhL/cbCJXLX/EKb1F52yn2Cy+dCqDhlv5foKn1+GIArgmYXEYUsh00BQwNDWDONPw5KknsyaguOQ1xrNnkGR5cACAIUShQ1BUMPCkaPpwIiqkOsMq4ADxNGpqgktwC5L7u9sp+1JcPFLMe+lsoozS3QybQq1SrX0tkr2yfdPrPBLeEk4zjAyy7oGOo35e0v4fE27DTV9zUT0zXDJLyK9oPAP32YeBH8dTBGg4QADpjJ53DVwyEEJjZkcZGYCIMYNX7juIoESAAZkr9QVNHR2UclKausPNESxcmYTWaSqJnipkhzO0uu8KmyIU8WRGX+O9oiaU5lTF04LfVJqIypDK3OOKmJ6khKXC6w0fmi0tOvLiJwiTN2o6G1g0SQRaG2TFwMc9PAvTsir4i6ofj2dTtmr2ASZAGzPSy3oVnGeP8phpyC3WPKjU8ZxozClF3OlT+D7rlwtOnTJUIAACH5BAgGAAAALAAAAABAAEAAhAQCBISChMTGxKSipGxubAwODLSytPz+/JSSlNTS1AwKDKyqrBQWFLy+vJyanAQGBMzKzKSmpHx+fBQSFLS2tNza3JyenP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAX+4CWOZGmeaKqubOu+cCzPdG3feK7vfO/Lh8Hi1zsQAAAJUWdEIpVLWxMwKTyjtOkkIbAmsTFtQtS9gltiUvl7VqVLa2jb9DbFsQ3IqX66EwNIESV8KH49Ek4AgiKEKYY6gAAKSA+CjSqPN4gABQIRD4FHVGMxmTSRnSIRiaM0pjGbqSOfSAWkrpMAAjWouyUDTg42CJQVNLG+Jg7BNMQADxSntckny0jCMc7Qx9Ms1gDYLtrRM70u3+Er49yc1N7M6pTkMuYx6CrrM8g09yf5Mga61ehH4p+MBQL5JUpnUF/CGBZYgRPRkJ0sGBGvoatYY9+LjBMvfJN36KEKkOmYvm3z4fEkPBLfhvxoeQIlilWBiNAkYTMFLUU6TV7oqeLnIpYPia4wGrSdCKUsmM6cBrWFVKSSXsa4WlKrjJ96pkpyVypXgyU7XwiYYAatUBYQvMiJkhaT3Dl1T8Rt2yavmrtzRvi9sJdNYMFvL7wKnLbw3MMkaC6GfMGjY8oqkE3GLCIWW8OcU2ziG1o06dIpFhhAzbo1ixAAIfkECAYAAAAsAAAAAEAAQACEBAIEhIKExMLEpKKkbG5sDA4M/P78tLK01NLUlJKUDAoMzMrMrKqsFBYUvL68nJqcBAYExMbEpKakfH58FBIUtLa01NbUnJ6c////AAAAAAAAAAAAAAAAAAAAAAAAAAAABf4gJo5kaZ5oqq5s675wLM90bd94ru987//AoHBILBpHFsHRVlEAJstZE0CFRl9TAKR6bWUTkQJX6FjAvqLw+BegSlzokfr5m1DdLMcWkDDNrTttAE5abylxfmJ0OnYABRESe4YmiCd/OYKPIhJUEJMjlSiXNo2aI5F4oIR9LaMzmREmnIUioSuuMKWxJ6gAErYsuC2wKrMQqzTCKrosvXw2cwzDVKbNdw82CBRUFyzMLw/XNAgNVAQGK8Qx4VTYMeTm6MvUuzLsAO4u8ADnKwf0Nu7lW7Gv3woGAGvcw8eioDxvCWVcuCMuhcNcEV9MbCcQxcUY31xsZIihY4mPMqNCrhg50KQIlDNUomBpwiRMGjJL0Dwh8GaNnCJ2orinyCCjjEErqlhodIdKoSvuDQDyDSqLAXc+8dBltUUvrU6pECIp4ytVigPL7jFTR2y9GREIOQgCtNW2RXSRtligCJCQuqL6HgFcgu8aI4TTCL5C2DBexnoVH+6S07HfLiJUKsOM4Ztlzih0bQadmdrdy6RLNJqc2kQj1K1NMDgQu7ZtEyEAACH5BAgGAAAALAAAAABAAEAAhAQCBISChMTGxExOTKyqrDQ2NJSWlHRydAwODPz+/LS2tIyOjNTS1Hx+fAQGBISGhMzKzFxaXLSytJyenHR2dBQWFLy+vP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAX+4CWOZGmeaKqubOu+cCzPdG3feK7vfO//wKBwSCwaj8ikcslsKQqLoQVyUzgAgEYwgCXUJFds9tcQA7wyMPaAwGp5XEC7G1MDDBfB/J0rywUEYmgtdngiem45cQgCIoF0LIUliGM2fowkj2crkiaUfDKLjSWagyadJ58zl6MmpSeoKKowoiqvJLEpsy2sLLcXuSq7KrUtr8Erwye9L5oUYYYxyiTFMJpY0TKUD8tYmDOaETcT3qferTPkWBM1EBVYFK7nNurrM+5rCd1/NPVi7DDwATigDwUzGPUmJHwhkOCKgy0WXpC4omHBh/Mi/iNBEYXFFxBRdBQxksRHGCGMS5QkudHEyRgpWdpLMfKljJQrVba8YHNVRpkAALJY2JMGs5wixTR4N/AiDlZIaZpp2uPSzhj1Bjjd4WdmPzFUyPycQclCkJgtplUd6wLCniJoZb01EreE20RI6h6am6Tu3UpL0KrNy5Yn3yYXIA4OnPEvKMQjWC1GfOkwZBNdAV82iHezLQmeQ4s2EQIAIfkECAYAAAAsAAAAAEAAQAAABP5wyUmrvTjrzbv/YCiOZGmeaKqubOu+cCzPdG3feK7vfG8NCpViEEMAAAKU4Bh4BY7HZGkJbbKMAAJUKqJmmatn1uDlfsoGLcB6whIMkjJIvkiDTeI3hc7h19VsIm5wFX4Yhn93IXmEFoh7Wxh2ayGDGo8LmBKTgRuMfZGFoRqcHZYdfpoVpRqfZ6GqFqwXp3NbsRezFK5dUKMhugsJR3pTvmYik2ZUxSQFvgUmyhW8Ic++ANEjwRLVHtfZ4Nog3BPeG+IS6R/lu8SN6FDjC+sc7dTvHPUT+5KAH+co9OMnj9Q/EAHpFcwwcNPBRfkqNJS4kMI9DtUmWth3sYMrjWEX1nX0wAgkBnEjARKraA3KQxVijswTAY6Si4QeUpLAuUFnCZ4YFLyMAXTVUBlFJQhVZKOoTxY8l9rckfCpk4gUpHbiUc0q0ohafVxg5LVGnqNi3VVJ64kp20MJ3sqdayECACH5BAgGAAAALAAAAABAAEAAAAT+cMlJq7046827/2AojmRpnmiqrmzrvnAsz3Rt33iu73xvDQqVYhBDAAAClOAYeAWOx2RpCW2yjAACVCqiZpmrZ9bg5X7KBi3AesISDJIySL5Ig03iN4XO4dfVbCJucBV+GIZ/dyF5hBaIe1sYdmshgxqPC5gSk4EbjH2RhaEanB2WHX6aFaUan2ehqhasF6dzW7EXsxSuXVCjIboLCUd6U75mIpNmVMUkBb4FJsoVvCHPvgDRI8ES1R7X2eDaINwT3hviEukf5bvEjehQ4wvrHO3U7xz1E/uSgB/nKPTjJ4/UPxAB6RXMMHDTwUX5KjSUuJDCPQ7VJlrYd7GDK41hF9Z19MAIJAZxIwESq2gNykMVYo7MEwGOkouEHlKSwLlBZwmeGBS8jAF01VAZRSUIVWSjqE8WPJfa3JHwqZOIFKR24lHNKtKIWn1cYOS1Rp6jYt1VSeuJKdtDCd7KnWshAgAh+QQIBgAAACwAAAAAQABAAAAE/nDJSau9OOvNu/9gKI5kaZ5oqq5s675wLM90bd94ru98bw0KlWIQQwAAApTgGHgFjsdkaQltsowAAlQqomaZq2fW4OV+ygYtwHrCEgySMki+SINN4jeFzuHX1WwibnAVfhiGf3cheYQWiHtbGHZrIYMajwuYEpOBG4x9kYWhGpwdlh1+mhWlGp9noaoWrBenc1uxF7MUrl1QoyG6CwlHelO+ZiKTZlTFJAW+BSbKFbwhz74A0SPBEtUe19ng2iDcE94b4hLpH+W7xI3oUOML6xzt1O8c9RP7koAf5yj04yeP1D8QAekVzDBw08FF+So0lLiQwj0O1SZa2HexgyuNYRfWdfTACCQGcSMBEqtoDcpDFWKOzBMBjpKLhB5SksC5QWcJnhgUvIwBdNVQGUUlCFVko6hPFjyX2tyR8KmTiBSkduJRzSrSiFp9XGDktUaeo2LdVUnriSnbQwneyp1rIQIAIfkECAYAAAAsAAAAAEAAQACEBAIEhIKExMbETE5MrKqsNDY0lJaUdHJ0DA4M/P78tLa0jI6M1NLUfH58BAYEhIaEzMrMXFpctLK0nJ6cdHZ0FBYUvL68////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABf7gJY5kaZ5oqq5s675wLM90bd94ru987//AoHBILBqPyKRyCVwUFExYAABwQG0QS7BBpVprBGrjNwUgDt5rLNwd87hmwcWQXncR4l0ZIRfRq2osbAAEAngAbjdwfCV/X4JdBCKGeTZ7fY11KoOSI5SINYuYJo6BJZwmn4lSVIwqpSeoJ6oxoi2wJLIotC6XL7gXuim8K7YwsMIqxCi+Mo5oVJ0uyyUPraMxf5Ey1COHEzcR2zPdFxRUFRA1E13gNZ/SIwnQ6TPs7TbwJ/Po6jD3XQC443ZoVQl+AOq5ADiBIcFKKRAqXOHwQsVpBVtI9JfiokV8Lcqh2NgRJAmPu40ywiBpAuUIlyRErmD50uQJmBdksqCJ86TNSSprkOxZwqPOFxLhCPwH8uhKaD9bMHQaI8GAqAvvQNwBAesLgKB8WLiWL6gPYw/DbiEbA4LZtXFgUNWBdoXbrUXqpsRrRG+Ju2qV+AXKN4lfwAaZ1J2bly3iKChEMUay6C1kE0oDX45ceLMJAhI8ix6dIgQAIfkECAYAAAAsAAAAAEAAQACEBAIEhIKExMLEpKKkbG5sDA4M/P78tLK01NLUlJKUDAoMzMrMrKqsFBYUvL68nJqcBAYExMbEpKakfH58FBIUtLa01NbUnJ6c////AAAAAAAAAAAAAAAAAAAAAAAAAAAABf4gJo5kaZ5oqq5s675wLM90bd94ru987//AoHBILN4EFuMtAIBUlLQJYOqExphN6tPakgIKkYSWu8KCReLm1rVwBL3nUbraYkwnP3PENF+n7FMAeDxweyd9KoAACnc7eiqIJ4oSEQWNOIUskSSTIpWXNY8tmxidI5+CNZkvkaYkqINXU3Ewfa4lsDGrMnMQUxIquS6AtDNpvyzCLBdTFAg2D4HALcoqBgTNzzPMUw8w1SnX2TLcAN4x4CjiAM4w0d006Sfr7S3l5/GWAAwt9Noq5czZQMWvHzZ2/04EhDdDXriD9UzceycQnb5YL/xJDHSOIj5qF2loHHGPhEcXDphdjCxZ4uSKlBkhImBpwiUKmDDW6auIwiaukDvWMVTh0xNQHhI4uvCJc4aiATBYNpUhwReAaVE5To1xK+ssUDsWWMW6LVAqHw5mGYrH6OyPXRbBvlUrY8FRIXCT3R2SN4VduUT6mtjaQ/CIv265GCYMpC9ijGREwGXMly6Gx5FTFKJsBA4FwJlNeAEdWjTp0iYYHEDNujWLEAAh+QQIBgAAACwAAAAAQABAAIQEAgSEgoTExsSkoqRsbmwMDgy0srT8/vyUkpTU0tQMCgysqqwUFhS8vrycmpwEBgTMysykpqR8fnwUEhS0trTc2tycnpz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF/uAljmRpnmiqrmzrvnAsz3Rt33iu73zvpwvL4dcLAACEITEnOR6Ty5sRUJg8lVFZkypIWJHYrGtaEIi8V7FrWyahweoV2Vx6Q+MnNt1kD+Mvcyp9JxANS3osgyQRRxI/gS2KFwtOAI48iC+DjEcKjTuQMHYDD0cRAgWfOJkyb04RIqiqNQJHD3szCammJLKWNhWlAAg2Fq8mvpc0FMLEMw5ODijJNsxHzjDQR9Ip1DXWw9nRLN7LzS7aANzku8oz4Ngp6est5e/n8uMx9jLwKPM0+MXwVwIgrV0LquETkU6dDV8JFV5jWGlbwHY54M0zCEPgN2H6ONbDyAOcwxEinVV4vEHJYkF9KknyiCAM1omUJVbaaAnAJgpjLpHJ3EGT1wqgJ3sN1cHT51GYF3TWKNoTBlJuUmk0lXE16wyqTq06WZoDQs1ildztaHCkDS1Pv4iw2ke2x1wXEOr6uLvC6w6+KPLOigM4p94shUUIjvtnRGG/UfguVtvYcVtckNVkmlx5hZ7Mf9h8odwZxZbBpT2jTr1igQHWsGPLCAEAIfkECAYAAAAsAAAAAEAAQACEBAIEhIKExMbETE5MrKqslJaUNDY0dHJ0DA4M/P78tLa0jI6M1NLUnJ6cfH58BAYEhIaEzMrMXFpctLK0nJqcdHZ0FBYUvL68////AAAAAAAAAAAAAAAAAAAAAAAAAAAABf4gJo5kaZ5oqq5s675wLM90bd8phFQJ7qsBgPDQ+xlHDqGSeDQGAQiKZVhs2pJQASYyBTCttCdCK+JSwTLsuGT2VtEsMZnd/cJV6rmpbb+b5Ct8b34ieS2ChCOALoiEhjCCERdwizFtA0IOYAtCazRtSppNBkM3WFCZTQoPQgU1FEoUAgipRxOsAK4ysEIUIrO1RretMbwAviPAAKLCuLotxsgkysw/w7nQsSjUTdfPKNEq3LbOKeEr483EJucs6dblJO0t7z7eI/Mu9Tj3+S/7N65J0FZDGYFuuAjSMGjlgBKFMQDeIKCkgT93tJZZoSjkIIYCEDEGM8IRgEcRIJx76ctY7UfJkyNSHhOpsclLFDKlnZBo42aKnNtYblQCE2dIDDxr+GQBNJlQm0RhNE1KY+mLnFRnWJWq5OmRCLiKxpBZs8kFIQ/0yMha45GMCF7RuP0XF85cFnBH+rmbgu0RvnvqJsIA2KnewYU6qR2RtyziEnz97lVMonHLxyYeSR6cxzJmF2oEf05xyvFoFlgun15BYMLq17BrhAAAIfkECAYAAAAsAAAAAEAAQAAABP5wyUmrvTjrzbv/YGglgmieVAAAAeqCyLq2b52pAEHMdk/FOYNhx/L1cASDZMgzuoBJCrPoNCGVlSmt+oFiLVqu56oJizVejvlsIXfWbEn6Az+7QfXqXJT3DVZRKH02CjIlKAUyVFUChieJgE2MjiGQAAWDNY0rhx6WBUtEW06bAJ0bn1KiYqWnGKlZq1ytGrBgspOcrzKgGZkvtBW2vriklBLDZcVGwckbvy6tzmrLPqW8J9Ao173ZRK493C5T4JqKK90h2iLS2OrV5roL08SS1sfz7tT24fjI+vUW3ZNngV4ofjaC7UKHYV0IhRmcOQQBsRbAiR8qonKH0YNGDmOfOnb42MESvBeFCJqwJNDPigNfTIj8cCeEgpM+anqYKULnhpsI7QCKqSwoG58WgLaMMwHpBJ42nCodxfSCT6hGak6tOmbowaVcbwzdGpYmIJxlMeAwmlYDDqptPSaIS7eujwgAIfkECAYAAAAsAAAAAEAAQAAABP5wyUmrvTjrzbv/YGglgmieVAAAAeqCyLq2b52pAEHMdk/FOYNhx/L1cASDZMgzuoBJCrPoNCGVlSmt+oFiLVqu56oJizVejvlsIXfWbEn6Az+7QfXqXJT3DVZRKH02CjIlKAUyVFUChieJgE2MjiGQAAWDNY0rhx6WBUtEW06bAJ0bn1KiYqWnGKlZq1ytGrBgspOcrzKgGZkvtBW2vriklBLDZcVGwckbvy6tzmrLPqW8J9Ao173ZRK493C5T4JqKK90h2iLS2OrV5roL08SS1sfz7tT24fjI+vUW3ZNngV4ofjaC7UKHYV0IhRmcOQQBsRbAiR8qonKH0YNGDmOfOnb42MESvBeFCJqwJNDPigNfTIj8cCeEgpM+anqYKULnhpsI7QCKqSwoG58WgLaMMwHpBJ42nCodxfSCT6hGak6tOmbowaVcbwzdGpYmIJxlMeAwmlYDDqptPSaIS7eujwgAIfkECAYAAAAsAAAAAEAAQAAABP5wyUmrvTjrzbv/YGglgmieVAAAAeqCyLq2b52pAEHMdk/FOYNhx/L1cASDZMgzuoBJCrPoNCGVlSmt+oFiLVqu56oJizVejvlsIXfWbEn6Az+7QfXqXJT3DVZRKH02CjIlKAUyVFUChieJgE2MjiGQAAWDNY0rhx6WBUtEW06bAJ0bn1KiYqWnGKlZq1ytGrBgspOcrzKgGZkvtBW2vriklBLDZcVGwckbvy6tzmrLPqW8J9Ao173ZRK493C5T4JqKK90h2iLS2OrV5roL08SS1sfz7tT24fjI+vUW3ZNngV4ofjaC7UKHYV0IhRmcOQQBsRbAiR8qonKH0YNGDmOfOnb42MESvBeFCJqwJNDPigNfTIj8cCeEgpM+anqYKULnhpsI7QCKqSwoG58WgLaMMwHpBJ42nCodxfSCT6hGak6tOmbowaVcbwzdGpYmIJxlMeAwmlYDDqptPSaIS7eujwgAIfkECAYAAAAsAAAAAEAAQACEBAIEhIKExMbETE5MrKqsNDY0lJaUdHJ0DA4M/P78tLa0jI6M1NLUfH58BAYEhIaEzMrMXFpctLK0nJ6cdHZ0FBYUvL68////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABf7gJY5kaZ5oqq5s675wbEqEbN9kAwAN7sOB3a73K6Z0AARiaGySgkmBYMlzNpEIgWjKtPqgWRK36rVhtaUxsfwCo01qtuusistVbpb9bqK39nwieS+Ad34whWWDMolOFjthOI1GEEI1OBNCZGUEljeZkF2cnjEGQhOTRZ07ly6gABNbVGteqwCtK6+xI6k/trgopju7YrNyvyq6KL0+yCfKKcw4ziTCsHrGbNQX0NiitaTdf9mjw+Iu0jcUmsM36TEKDuzENmPAP/E7Eac+9k75AAxw41ePXBGAAkWcG/cNn7yAJRbWMehwR8KIBL1tOvjwogmJaSj6QJgr44l3LY5IsgCJkoXKFgtbrnjpyqRMFTRfQLuZIicMXTxTFNhx4Me6UBuNLID0RgaDCuxoOTkE4+mOAQ2tUG1hFcCBBAIsBNqqouvXQDmYcoXqNQHaEmRLmHX7Fq5aFHPrnoibV+/euyP6+v0bJTDbs4OPqBWcGAWWCYfpNlaBRAjiySsqX8a84gGCzZxDix5NunEIACH5BAgGAAAALAAAAABAAEAAhAQCBISChMTCxKSipGxubAwODPz+/LSytNTS1AwKDJSSlMzKzKyqrBQWFLy+vAQGBMTGxKSmpHx+fBQSFLS2tNTW1JyenP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAX+4CWOZGmeaKqubOu+cGwejGzfpAQAEu7Dgd2u9yumdIBCYWhskoJJCGTJczaRBYhoyrT6oFkSt+q1YbWlMbH8AqNNarbrrIrLVW6W/W6it/Z8InkvgHd+MIVlgzKJTg47CW82EAldZQtCET4WQmRlEQ87mjackJZeoKIypQAWjUapAKMurBYiAlRrqKGytEK2I69FsbMptSa4p1bEKscnwj/MJ84oyZ67O8Ak1CnQOBSV2du/Lta6RuCdrSLcerlO6QAKte0t5ujhCuzq65PvPvH0jWDV74a1GjcCmqiHiApCGQqnkbNxz0ZEFAxXeEtx0djEcv8g5vMl7k/IGB2lWWQkUVHkDoEwVl7YiCLli4wtY1QYiYPVADgnYwjY8UCSDARUegULKuNQDAQN1I1awNTMjjBPowIgMIBXBKrKfDhlAXUHAQMXIhANd67I2BRlt6IVoVZIWyNvTcQ9W6Lu3StXjZbYOzeNg0B5LxAOtOLtYsaNA5N4DDlyFBGUK1vOklnz5glmC3tugST06BhI+J6OwcCC6NWwY8ueTbu27du4SYQAACH5BAgGAAAALAAAAABAAEAAhAQCBISChMTGxKSipGxubAwODLSytPz+/NTS1AwKDJSSlKyqrBQWFLy+vAQGBMzKzKSmpHx+fBQSFLS2tNza3JyenP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAX+oCWOZGmeaKqubOu+cGwai2zfZAQAEe7Dgd2u9yumdIBCYWhskoJJgWDJczaRBYFoyrT6oFkSt+q1YbWlMbH8AqNNarbrrIrLVW6W/W6it/Z8InkvgHd+MIVlgzKJTg07CW82AgldZQ9CED4VQmRlEA47mjackJZeoKIypQAVjUapAKMurBVbVGuoQrYttWK4ZQcEnbwqvmnATsI7VK3GuyivMssAEgjHJtgn0i/U1iLa4NAr3CzeCCTa4SnlKefZ4+t1yTDvJ7Xy5PQt9iis44z2qeiX4l+xSVRqrCD4bMfBgDsUuhtWDd2LfHoqeULBsBdAQgJNdKT1MeMpFAOednzDwWqWvpMoFjCTJENBJ5fRJMA8MvOGTQChgOIs8SDkikMvfjqYIFPViQcac71AykLpBBGxhrbjGcWFVRJNHbgsuhMG1RNfS2QVQXYjjrMk0poIC2HrnJ5odyxVkcpBVC9n5aZoWvYHUsF8Cxfxg3jFgwaBzjQOdBeAxr2UbyABejXzW86efwigELq06dOoU6tezbq169ewY8ueHQIAIfkECAYAAAAsAAAAAEAAQACEBAIEhIKExMbETE5MrKqsNDY0lJaUdHJ0DA4M/P78tLa0jI6M1NLUfH58BAYEhIaEzMrMXFpctLK0nJ6cdHZ0FBYUvL68////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABf7gJY5kaZ5oqq5s675wbEqEbN9kAwAN7sOB3a73K6Z0AARiaGySgkmBYMlzNpEIgWjKtPqgWRK36rVhtaUxsfwCo01qtuusistVbpb9bqK39nwieS+Ad34whWWDMolOFjthOI1GEEITPhNCZF4JA5Y3mZBdTgkHmgCXMaGokzalOxVIqDCrqa0wrwAVEBe1Lr4jty25uyPAKsfBVGsyxLwkySbRyqO4prrPJdMi29SbLs4p091iyy/hyJ/G6nrmLOgrwOQnwvAstfMorfYtq+wxjfj90pTqxpgaJSjAyiYj34qDJqgUvBFBCEJG7koskmHg1EVCGftAegOjIwAH15IAfGxX7cQhFyYdSLhAwKILYSJerog5U0TNHSvphVyhEwXPEj9V1hnKomiJoyaSBt3CtIVTEVBPSIVTdc7IE1lRbPXGzMxXEmFTjMVp9eyFtCqksvUa5e0OmTGSdsWB5RpeGUm/OZF1sqeNn2WtIPkryUKgBQUUBJpMubLly5gza97MubPnz6BDix5NurTp0yJCAAA7'

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#buttonText = 'Connect wallet';
  }

  static get observedAttributes() { 
    return ['text']; 
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue !== oldValue) {
      this.#buttonText = newValue;
    }
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    // Setup wallets
    this.#buildWalletList();
    this.#buildLoading();
    this.shadowRoot.getElementById(this.#BUTTON_ID).innerText = this.#buttonText;
    this.shadowRoot.getElementById(this.#BUTTON_ID).onclick = () => this.#toggleWallets();
  }

  #toggleWallets() {
    const walletsElm = this.shadowRoot.getElementById(this.#WALLETS_ID);
    const loadingElm = this.shadowRoot.getElementById(this.#LOADING_ID);
    const { offsetLeft } = this.shadowRoot.getElementById(this.#BUTTON_ID);
    // toggle display of list
    walletsElm.classList.toggle('hidden');
    this.#walletsPosition(walletsElm, offsetLeft);
    this.#loadingPosition(loadingElm, offsetLeft);
  }

  #toggleLoading() {
    const loadingElm = this.shadowRoot.getElementById(this.#LOADING_ID);
    loadingElm.classList.toggle('hidden');
  }

  #walletsPosition(elm, offsetLeft) {
    const { offsetWidth } = elm;
    if (offsetWidth + offsetLeft > window.innerWidth) {
      elm.style.right = '8px';
    } else {
      elm.style.left = offsetLeft;
    }
  }

  #loadingPosition(elm, offsetLeft) {
    const { offsetWidth } = elm;
    if (offsetWidth + offsetLeft > window.innerWidth) {
      elm.style.right = '8px';
    } else {
      elm.style.left = offsetLeft;
    }
  }

  #selectWallet(wallet) {
    const cardano = window?.cardano;
    const cardanoWallet = cardano?.[wallet.id];
    
    cardanoWallet.enable().then(
      (api) => {
        this.#toggleLoading();
        api.getBalance().then((balance) => {
          this.#toggleWallets();
          this.#toggleLoading();
          const evt = new CustomEvent(this.#EVENT, {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              balance,
              name: cardanoWallet.name,
              icon: wallet.icon,
              api
            }
          });
          this.dispatchEvent(evt);
        });
      },
      (err) => {
        this.#toggleWallets();
        const evt = new CustomEvent(this.#EVENT_ERROR, {
          bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              name: cardanoWallet.name,
              icon: wallet.icon,
              code: err?.code,
              info: err?.info
            }
        });
        this.dispatchEvent(evt)
      }
    );
  }

  #buildWalletList() {
    const el = this.shadowRoot.getElementById(this.#WALLETS_ID);
    this.#wallets.forEach((wallet, idx) => {
      const li = document.createElement('li');
      li.setAttribute('id', wallet.id);
      li.addEventListener('click', () => this.#selectWallet(wallet));
      li.setAttribute('tabIndex', `${idx + 2}`);
      
      if (wallet.icon) { // add icon if one is defined
        const img = document.createElement('img');
        img.src = wallet.icon;
        img.setAttribute('class', 'image');
        li.appendChild(img);
      } else {
        const div = document.createElement('div');
        div.setAttribute('class', 'image');
        li.appendChild(div);
      }
      
      const txt = document.createElement('span');
      txt.innerText = wallet.display;
      li.appendChild(txt);

      el.appendChild(li);
    });
  }

  #buildLoading() {
    const el = this.shadowRoot.getElementById(this.#LOADING_ID);
    const img = document.createElement('img');
    img.src = this.#loadingGif;
    img.setAttribute('class', 'loadingImage');
    el.appendChild(img);
  }
}

customElements.define('cardano-connect', CardanoConnect);