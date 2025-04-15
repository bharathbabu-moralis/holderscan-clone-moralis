# HolderScan Clone - Holder Analytics Terminal - Powered by Moralis

A comprehensive dashboard for tracking token holder data across multiple blockchains, providing insights into holder trends, distributions, and market dynamics.

![HolderScan Clone](https://github.com/bharathbabu-moralis/holderscan-clone-moralis/blob/main/screenshots/dashboard.png)

## Overview

This application provides detailed analytics on token holders across Ethereum, Solana, and other EVM-compatible blockchains. Track token holder metrics, analyze holder trends, and discover trending tokens with significant holder activity.

## Features

- **Multi-Chain Support**: Track tokens across Ethereum, Solana, BASE, and other EVM chains
- **Token Dashboard**: Add and monitor your favorite tokens
- **Holder Analytics**: View comprehensive holder statistics including:
  - Holder count changes (4h, 12h, 1d, 3d, 7d)
  - Holder distribution by wallet size
  - Market cap per holder ratios
- **Token Trends Page**: Discover biggest gainers and losers in holder count
- **Token Detail Page**: In-depth analysis of individual tokens with:
  - Detailed holder metrics
  - Interactive price and holder charts
  - Holder distribution breakdown
- **Real-Time Search**: Find tokens by name, symbol, or contract address

# Moralis APIs Used

| Feature                       | API Endpoint                                       | Description                                  | Documentation                                                                                |
| ----------------------------- | -------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Token Search**              | `GET /api/v2.2/tokens/search`                      | Search for tokens by name, symbol or address | [Link](https://docs.moralis.com/web3-data-api/evm/reference/search-tokens)                   |
| **EVM Token Metadata**        | `GET /api/v2.2/erc20/metadata`                     | Get detailed information about EVM tokens    | [Link](https://docs.moralis.com/web3-data-api/evm/reference/get-token-metadata)              |
| **Solana Token Metadata**     | `GET /token/mainnet/{address}/metadata`            | Get detailed information about Solana tokens | [Link](https://docs.moralis.com/web3-data-api/solana/reference/get-token-metadata)           |
| **Trending Tokens**           | `GET /api/v2.2/tokens/trending`                    | Get currently trending tokens                | [Link](https://docs.moralis.com/web3-data-api/evm/reference/get-trending-tokens)             |
| **EVM Holder Stats**          | `GET /api/v2.2/erc20/{address}/holders`            | Get holder statistics for EVM tokens         | [Link](https://docs.moralis.com/web3-data-api/evm/reference/get-token-holder-stats)          |
| **Solana Holder Stats**       | `GET /token/mainnet/holders/{address}`             | Get holder statistics for Solana tokens      | [Link](https://docs.moralis.com/web3-data-api/solana/reference/get-token-holder-stats)       |
| **EVM Historical Holders**    | `GET /api/v2.2/erc20/{address}/holders/historical` | Get historical holder data for EVM tokens    | [Link](https://docs.moralis.com/web3-data-api/evm/reference/get-historical-token-holders)    |
| **Solana Historical Holders** | `GET /token/mainnet/holders/{address}/historical`  | Get historical holder data for Solana tokens | [Link](https://docs.moralis.com/web3-data-api/solana/reference/get-historical-token-holders) |
| **Price Chart Widget**        | Moralis Chart Widget                               | Interactive price and holder chart widget    | [Link](https://moralis.com/widgets/price-chart)                                              |

## Tech Stack

### Frontend

- React
- React Router for navigation
- Chart.js for data visualization
- TailwindCSS for styling
- Moralis Price Chart Widget for token charts

### Backend

- Node.js with Express
- Moralis API integration for blockchain data

## Getting Started

### Prerequisites

- Node.js (v14+)
- Moralis API Key

### Installation

#### Backend Setup

1. Clone the repository

   ```
   git clone https://github.com/bharathbabu-moralis/holderscan-clone-moralis.git
   cd holderscan-clone
   ```

2. Install backend dependencies

   ```
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with your Moralis API key

   ```
   PORT=9000
   MORALIS_API_KEY=your_moralis_api_key_here
   ```

4. Start the backend server
   ```
   npm run dev
   ```

#### Frontend Setup

1. Install frontend dependencies

   ```
   cd ../client
   npm install
   ```

2. Start the frontend development server

   ```
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints on HolderAnalytics Backend (Express Server that calls Moralis APIs)

### Token Search and Data

- `GET /api/search?query=xyz&chain=eth` - Search for tokens
- `GET /api/token/:chain/:address` - Get detailed token information

### Holder Statistics

- `GET /api/holders/:chain/:address` - Get token holder statistics
- `GET /api/holders/:chain/:address/historical` - Get historical holder data

### Trending Analysis

- `GET /api/trends` - Get trending tokens with holder statistics

## Moralis APIs Used

The application leverages the following Moralis API endpoints:

### Token Data

- Token Metadata (EVM & Solana)
- Trending Tokens

### Holder Analytics

- Token Holder Statistics (EVM & Solana)
- Historical Token Holders data (EVM & Solana)

### Visualization

- Moralis Price Chart Widget

## Project Structure

```
holderscan-clone-moralis/
├── backend/              # Backend Express server
│   ├── index.js         # Server entry point
│   ├── routes.js        # API routes
│   ├── controllers.js   # API controllers
│   └── package.json     # Backend dependencies
│
└── frontend/              # Frontend React application
    ├── public/          # Static assets
    ├── src/
    │   ├── components/  # React components
    │   │   ├── Dashboard.js
    │   │   ├── TokenCard.js
    │   │   ├── SearchBar.js
    │   │   ├── AddTokenModal.js
    │   │   ├── HolderTrends.js
    │   │   └── PriceChartWidget.js
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   └── TokenDetailPage.js
    │   ├── App.js       # Main application component
    │   └── index.js     # Application entry point
    └── package.json     # Frontend dependencies
```

## Moralis Integration

This project showcases how to integrate Moralis APIs to build a comprehensive token analytics platform. It leverages Moralis' robust infrastructure to provide real-time blockchain data across multiple networks.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
