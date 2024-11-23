Concept:
KaBoom is trying to connect users on mini programs with Defi protocols on TON (e.g DEX, DEX perps, launchpad and staking). We would like to faciliate existing mini-program owners to monetize their traffic and user base with Defi protocols as well as memecoin tradings. DeDust is our initial step to integrate as a showcase. We are implementing the "One Click Investment" thesis of TON foundation Defi teams, creating a smooth and secured toolkit for Telegram groups/bots/mini programs to embrace Deif protocols. 


Code Structure
Backend code is in charge of fetching latest pool info and price/volume/marketcap data from dedust/dexscreener api, as well as execute buy/sell order and record transactions(under development) through dedust SDK and TONCONNECTUI
1. dedust_api.js
2. dedust_trade.js
3. dexscreener_api.js

Frontend code is the trading page which is embeded into an existing mini program
1. tradePage.js
2. tabs.js

TO DO:
1. the createSwapPayload functions for dedust backend still have some issues to be solved as the TONCONNECTUI could not get correct payload message from dedust, there is lack of clear code example from dedust sdk in this situation.
   We are working closely with TON foundation dev rel team to solve this issue
2. Next step: track the transaction of a user and calculate PnL for it
