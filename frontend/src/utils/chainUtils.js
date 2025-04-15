/**
 * Utility functions for working with blockchain chains
 */

/**
 * Get the logo path for a given chain ID
 * @param {string|number} chainId - The chain ID
 * @returns {string} - The path to the chain logo
 */
export const getChainLogo = (chainId) => {
  // Normalize the chainId to lowercase string
  const normalizedChainId = (chainId || "").toString().toLowerCase();

  // Mapping of chain IDs to logo paths
  const chainMapping = {
    // Ethereum
    eth: "/assets/chains/ethereum.svg",
    ethereum: "/assets/chains/ethereum.svg",
    "0x1": "/assets/chains/ethereum.svg",
    1: "/assets/chains/ethereum.svg",

    // Binance Smart Chain
    bsc: "/assets/chains/binance.svg",
    binance: "/assets/chains/binance.svg",
    "0x38": "/assets/chains/binance.svg",
    56: "/assets/chains/binance.svg",

    // Polygon
    polygon: "/assets/chains/polygon.svg",
    matic: "/assets/chains/polygon.svg",
    "0x89": "/assets/chains/polygon.svg",
    137: "/assets/chains/polygon.svg",

    // Solana
    solana: "/assets/chains/solana.svg",

    // Avalanche
    avalanche: "/assets/chains/avalanche.svg",
    avax: "/assets/chains/avalanche.svg",
    "0xa86a": "/assets/chains/avalanche.svg",
    43114: "/assets/chains/avalanche.svg",

    // Fantom
    fantom: "/assets/chains/fantom.svg",
    ftm: "/assets/chains/fantom.svg",
    "0xfa": "/assets/chains/fantom.svg",
    250: "/assets/chains/fantom.svg",

    // Arbitrum
    arbitrum: "/assets/chains/arbitrum.svg",
    "0xa4b1": "/assets/chains/arbitrum.svg",
    42161: "/assets/chains/arbitrum.svg",

    // Optimism
    optimism: "/assets/chains/optimism.svg",
    "0xa": "/assets/chains/optimism.svg",
    10: "/assets/chains/optimism.svg",

    // Base
    base: "/assets/chains/base.svg",
    "0x2105": "/assets/chains/base.svg",
    8453: "/assets/chains/base.svg",

    // Linea
    linea: "/assets/chains/linea.svg",
    "0xe708": "/assets/chains/linea.svg",

    // Pulse
    pulse: "/assets/chains/pulse.svg",
    "0x171": "/assets/chains/pulse.svg",

    // Ronin
    ronin: "/assets/chains/ronin.svg",
    "0x7e4": "/assets/chains/ronin.svg",

    // ... other chains ...
  };

  // Return the logo path or default to Ethereum
  return chainMapping[normalizedChainId] || "/assets/chains/ethereum.svg";
};
