# HolderAnalytics

A powerful dashboard for tracking and analyzing token holder data across multiple blockchains, powered by Moralis.

## Overview

HolderAnalytics is a React-based web application that allows crypto investors and researchers to:

- Track token holder data and trends across various blockchains
- Search and discover tokens
- Monitor price movements
- Analyze holder distributions
- Track popular and trending tokens

## Features

- **Multi-chain Support**: Track tokens on Ethereum, Solana, and other EVM-compatible blockchains
- **Token Dashboard**: Add and monitor your favorite tokens in one place
- **Detailed Token Analytics**: View comprehensive data about token holders, distribution, and price changes
- **Trending Tokens**: Discover popular tokens with significant holder activity
- **Search Functionality**: Easily find tokens across multiple blockchains

## Technologies

- React 19
- React Router 7
- Chart.js for data visualization
- Axios for API requests
- TailwindCSS for styling
- Moralis API integration for blockchain data

## Getting Started

### Prerequisites

- Node.js (16.x or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/bharathbabu-moralis/holderscan-clone-moralis.git
   cd holderscan-clone-moralis/frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with your API keys and configuration variables.

4. Start the development server:

   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Project Structure

frontend/
├── public/ # Static files
├── src/ # Source code
│ ├── components/ # React components
│ │ ├── Dashboard.js # Main dashboard view
│ │ ├── TokenCard.js # Individual token display
│ │ ├── TokenPage.js # Detailed token view
│ │ ├── TrendingTokensScroller.js # Trending tokens display
│ │ ├── HolderTrends.js # Holder trends analysis
│ │ ├── PriceChartWidget.js # Price chart component
│ │ ├── SearchBar.js # Token search functionality
│ │ └── AddTokenModal.js # Modal for adding tokens
│ ├── utils/ # Utility functions
│ │ ├── formatUtils.js # Formatting helpers
│ │ ├── chainUtils.js # Blockchain utilities
│ │ └── localStorage.js # Local storage management
│ ├── App.js # Main application component
│ └── index.js # Application entry point
└── package.json # Project dependencies and scripts

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects the app from Create React App

## API Integration

The application connects to a backend server running on `http://localhost:9000` that provides:

- Token metadata
- Holder statistics
- Trending tokens
- Search functionality

Make sure the backend server is running before starting the application.

## Relevant Links

- [Moralis](https://developers.moralis.com) for blockchain data APIs
- [Moralis Docs](https://docs.moralis.com)
- [Moralis Terminal](https://moralis.com)
