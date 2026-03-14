# Open Swap

## Project Intro

Open Swap is a decentralized exchange (DEX) frontend built with React + Vite.
It provides wallet connection, token swap, liquidity management, and chart/market views in a single interface.

The current configuration connects to a testnet environment (Sepolia chain ID in env), and reads token/pair data from a backend API.

## Tech Stack

- Frontend: React 18, Vite 5, React Router
- State management: Redux Toolkit, React Redux
- Web3: ethers v6, @web3-onboard (MetaMask + injected wallets)
- UI: MUI, Tailwind CSS, Emotion
- Data & visualization: Axios, ECharts, lightweight-charts, dayjs
- Notifications: notistack
- Deployment: Vercel

## Features

- Wallet connect/disconnect (MetaMask + injected wallets)
- Network check and switch based on configured `VITE_CHAIN_ID`
- Token swap (ERC20 <-> ERC20, ETH <-> ERC20)
- Token approval flow before swap/liquidity operations
- Add liquidity and remove liquidity
- LP token position management
- Slippage and transaction deadline controls
- Token/pair fetching from backend API and price reference from CoinGecko
- Multi-page app: Swap, Info, Landing, LaunchPad
- Light/Dark theme switch and transaction status notifications

## Demo Link

- https://open-swap-three.vercel.app/

## How to Run

### 1. Prerequisites

- Node.js 18+
- npm or yarn

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Configure environment variables

This project already includes `.env.development` and `.env.production`.
If you want to override local values, create `.env.local`:

```bash
VITE_CHAIN_ID=0xaa36a7
VITE_API_URL=https://testnet-api.point.market/point-market
VITE_SWAP_ROUTER=0x68C2F3e8A8Fbd0Ae1426ba157e14a1e3266f591A
```

### 4. Start development server

```bash
npm run dev
# or
yarn dev
```

### 5. Build and preview

```bash
npm run build
npm run preview

# or
yarn build
yarn preview
```

## Notes

- Use a wallet account with testnet ETH for transactions.
- RPC endpoints are configured in `src/main.jsx` with public RPC URLs.
