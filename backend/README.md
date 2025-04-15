# HolderAnalytics Backend

A backend API for blockchain token analytics, providing data about cryptocurrency tokens across EVM chains and Solana using the Moralis API.

## Quick Start

```bash
# Install dependencies
npm install

# Set up .env file with your Moralis API key
echo "MORALIS_API_KEY=your_api_key_here" > .env
echo "PORT=9000" >> .env

# Start the server
npm start

# For development with auto-reload
npm run dev
```

## API Endpoints

### Search & Metadata

- `GET /api/search?query=bitcoin&chain=eth` - Search for tokens
- `GET /api/token/evm/metadata?chain=eth&address=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599` - Get EVM token metadata
- `GET /api/token/solana/{tokenAddress}/metadata` - Get Solana token metadata

### Holders

- `GET /api/holders/{chain}/{address}` - Get token holder statistics
- `GET /api/holders/{chain}/{address}/historical` - Get historical holder data
- `GET /api/token/{chain}/{address}/owners` - Get token top holders

### Trending

- `GET /api/trending-tokens` - Get trending tokens
- `GET /api/trends` - Get trending tokens with holder changes

## Tech Stack

- Node.js and Express
- Moralis API for blockchain data

## Relevant Links

- [Moralis](https://developers.moralis.com) for blockchain data APIs
- [Moralis Docs](https://docs.moralis.com)
- [Moralis Terminal](https://moralis.com)
