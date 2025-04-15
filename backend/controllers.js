const axios = require("axios");
require("dotenv").config();

// Moralis API configuration
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
console.log("API Key loaded:", MORALIS_API_KEY ? "Yes (masked)" : "No");
const EVM_BASE_URL = "https://deep-index.moralis.io/api/v2.2";
const SOLANA_BASE_URL = "https://solana-gateway.moralis.io";

// Headers for Moralis API requests
const headers = {
  "X-API-Key": MORALIS_API_KEY,
  accept: "application/json",
};

/**
 * Search for tokens
 */
const searchTokens = async (req, res) => {
  try {
    const { query, chain } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Create params object with query
    const params = { query };

    // Single unified search endpoint
    const response = await axios.get(`${EVM_BASE_URL}/tokens/search`, {
      params,
      headers,
    });

    return res.json(response.data);
  } catch (error) {
    // In the catch block of your controllers
    console.error("Full error response:", error.response?.data);
    console.error("Error searching tokens:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to search tokens",
      error: error.message,
    });
  }
};

/**
 * Get token holder statistics
 */
const getTokenHolderStats = async (req, res) => {
  try {
    const { chain, address } = req.params;

    if (chain === "solana") {
      // Solana token holder stats
      const response = await axios.get(
        `${SOLANA_BASE_URL}/token/mainnet/holders/${address}`,
        {
          headers,
        }
      );
      return res.json(response.data);
    } else {
      // EVM token holder stats
      const response = await axios.get(
        `${EVM_BASE_URL}/erc20/${address}/holders`,
        {
          params: { chain },
          headers,
        }
      );
      return res.json(response.data);
    }
  } catch (error) {
    console.error("Error getting token holder stats:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get token holder statistics",
      error: error.message,
    });
  }
};

/**
 * Get historical token holder data
 */
const getTokenHolderHistory = async (req, res) => {
  try {
    const { chain, address } = req.params;
    const { fromDate, toDate, timeFrame = "1d" } = req.query;

    // Default date range if not provided (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const from = fromDate || thirtyDaysAgo.toISOString();
    const to = toDate || today.toISOString();

    if (chain === "solana") {
      // Solana historical holder data
      const response = await axios.get(
        `${SOLANA_BASE_URL}/token/mainnet/holders/${address}/historical`,
        {
          params: {
            fromDate: from,
            toDate: to,
            timeFrame,
          },
          headers,
        }
      );
      return res.json(response.data);
    } else {
      // EVM historical holder data
      const response = await axios.get(
        `${EVM_BASE_URL}/erc20/${address}/holders/historical`,
        {
          params: {
            chain,
            fromDate: from,
            toDate: to,
            timeFrame,
          },
          headers,
        }
      );
      return res.json(response.data);
    }
  } catch (error) {
    console.error("Error getting token holder history:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get token holder history",
      error: error.message,
    });
  }
};

const getTrendingHolderChanges = async (req, res) => {
  try {
    // Fetch trending tokens
    const trendingResponse = await axios.get(
      `${EVM_BASE_URL}/tokens/trending`,
      {
        headers,
      }
    );

    const tokens = trendingResponse.data || [];

    // Use Promise.all to make API calls in parallel
    const tokensWithHolderChangesPromises = tokens.map(async (token) => {
      try {
        const chainId = token.chainId;
        const tokenAddress = token.tokenAddress;

        // Determine which API to call based on chain
        let holderStatsResponse;
        if (chainId === "solana") {
          holderStatsResponse = await axios.get(
            `${SOLANA_BASE_URL}/token/mainnet/holders/${tokenAddress}`,
            {
              headers,
            }
          );
        } else {
          holderStatsResponse = await axios.get(
            `${EVM_BASE_URL}/erc20/${tokenAddress}/holders`,
            {
              params: { chain: chainId },
              headers,
            }
          );
        }

        // Return combined token data with holder stats
        return {
          ...token,
          holderStats: holderStatsResponse.data,
        };
      } catch (error) {
        console.error(
          `Error getting holder stats for token ${
            token.symbol || token.tokenAddress
          }:`,
          error.message
        );
        // Return null for failed tokens
        return null;
      }
    });

    // Wait for all promises to resolve
    const tokensWithHolderChanges = await Promise.all(
      tokensWithHolderChangesPromises
    );

    // Filter out failed tokens (null values) and tokens without valid holder stats
    const validTokens = tokensWithHolderChanges.filter(
      (token) =>
        token !== null &&
        token.holderStats &&
        token.holderStats.holderChange &&
        token.holderStats.holderChange["24h"]
    );

    // Split into gainers and losers
    const gainers = validTokens
      .filter((token) => token.holderStats.holderChange["24h"].change > 0)
      .sort(
        (a, b) =>
          b.holderStats.holderChange["24h"].changePercent -
          a.holderStats.holderChange["24h"].changePercent
      )
      .slice(0, 15);

    const losers = validTokens
      .filter((token) => token.holderStats.holderChange["24h"].change < 0)
      .sort(
        (a, b) =>
          a.holderStats.holderChange["24h"].changePercent -
          b.holderStats.holderChange["24h"].changePercent
      )
      .slice(0, 15);

    // Add some debug information in development environment
    const debugInfo =
      process.env.NODE_ENV === "development"
        ? {
            totalTokensFetched: tokens.length,
            validTokensCount: validTokens.length,
            gainersCount: gainers.length,
            losersCount: losers.length,
            processingTime: `${Date.now() - req.startTime}ms`, // You'll need middleware to set req.startTime
          }
        : null;

    res.json({
      gainers,
      losers,
      debug: debugInfo,
    });
  } catch (error) {
    console.error("Error getting trending holder changes:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get trending holder changes",
      error: error.message,
    });
  }
};

/**
 * Get trending tokens
 */
const getTrendingTokens = async (req, res) => {
  try {
    const { chain } = req.query;

    let params = {};
    if (chain) {
      params.chain = chain;
    }

    // Fetch trending tokens from Moralis
    const response = await axios.get(`${EVM_BASE_URL}/tokens/trending`, {
      params,
      headers,
    });

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error getting trending tokens:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get trending tokens",
      error: error.message,
    });
  }
};

/**
 * Get EVM token metadata
 */
const getEVMTokenMetadata = async (req, res) => {
  try {
    const { chain, address, addresses } = req.query;

    if (!chain) {
      return res.status(400).json({
        success: false,
        message: "Chain parameter is required",
      });
    }

    // Handle both 'address' (singular) and 'addresses' (plural) parameters
    let tokenAddresses = [];

    // Check if we have the singular 'address' parameter
    if (address) {
      tokenAddresses.push(address);
    }

    // Check if we have the plural 'addresses' parameter
    if (addresses) {
      // Handle both string and array formats
      if (Array.isArray(addresses)) {
        tokenAddresses = [...tokenAddresses, ...addresses];
      } else {
        tokenAddresses.push(addresses);
      }
    }

    // Ensure we have at least one address
    if (tokenAddresses.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one token address is required (use 'address' or 'addresses' parameter)",
      });
    }

    // Construct query parameters for Moralis API
    const params = {
      chain,
      addresses: tokenAddresses,
    };

    console.log("Making request to Moralis with params:", params);

    // Fetch token metadata from Moralis
    const response = await axios.get(`${EVM_BASE_URL}/erc20/metadata`, {
      params,
      headers,
      paramsSerializer: (params) => {
        return Object.entries(params)
          .reduce((acc, [key, value]) => {
            if (Array.isArray(value)) {
              return value.reduce((queryString, item, idx) => {
                return (
                  queryString + `&${key}[${idx}]=${encodeURIComponent(item)}`
                );
              }, acc);
            }
            return acc + `&${key}=${encodeURIComponent(value)}`;
          }, "")
          .substring(1);
      },
    });

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error getting EVM token metadata:", error.message);
    console.error("Full error response:", error.response?.data);

    return res.status(500).json({
      success: false,
      message: "Failed to get EVM token metadata",
      error: error.message,
      details: error.response?.data,
    });
  }
};

/**
 * Get Solana token metadata
 */
const getSolanaTokenMetadata = async (req, res) => {
  try {
    const { tokenAddress } = req.params;

    if (!tokenAddress) {
      return res.status(400).json({
        success: false,
        message: "Token address parameter is required",
      });
    }

    // Fetch Solana token metadata from Moralis
    const response = await axios.get(
      `${SOLANA_BASE_URL}/token/mainnet/${tokenAddress}/metadata`,
      {
        headers,
      }
    );

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error getting Solana token metadata:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get Solana token metadata",
      error: error.message,
    });
  }
};

/**
 * Get owners of an ERC20 token
 */
const getTokenOwners = async (req, res) => {
  try {
    const { chain, address } = req.params;
    const { order = "DESC", cursor, limit = 100 } = req.query;

    if (!chain || !address) {
      return res.status(400).json({
        success: false,
        message: "Chain and token address parameters are required",
      });
    }

    // Build params object
    const params = {
      chain,
      order,
    };

    // Add optional pagination parameters
    if (cursor) {
      params.cursor = cursor;
    }

    if (limit) {
      params.limit = limit;
    }

    // Fetch token owners from Moralis
    const response = await axios.get(
      `${EVM_BASE_URL}/erc20/${address}/owners`,
      {
        params,
        headers,
      }
    );

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error getting token owners:", error.message);
    console.error("Full error response:", error.response?.data);

    return res.status(500).json({
      success: false,
      message: "Failed to get token owners",
      error: error.message,
      details: error.response?.data,
    });
  }
};

module.exports = {
  searchTokens,
  getTokenHolderStats,
  getTokenHolderHistory,
  getTrendingHolderChanges,
  getTrendingTokens,
  getEVMTokenMetadata,
  getSolanaTokenMetadata,
  getTokenOwners,
};
