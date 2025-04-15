import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const AddTokenModal = ({ isOpen, onClose, onAddToken }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Clear search results when opening the modal
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Get chain logo path
  const getChainLogo = (chainId) => {
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
    };

    // Return the logo path or default to Ethereum
    return chainMapping[normalizedChainId] || "/assets/chains/ethereum.svg";
  };

  // Format USD price
  const formatPrice = (price) => {
    if (!price) return "N/A";
    return `$${parseFloat(price).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`;
  };

  // Format market cap
  const formatMarketCap = (marketCap) => {
    if (!marketCap) return "N/A";

    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  // Format percent change
  const formatPercentChange = (change) => {
    if (change === undefined || change === null) return "N/A";

    const value = parseFloat(change);
    const isPositive = value >= 0;
    const sign = isPositive ? "+" : "";
    const className = isPositive ? "text-green-500" : "text-red-500";

    return (
      <span className={className}>
        {sign}
        {value.toFixed(2)}%
      </span>
    );
  };

  // Search for tokens
  const searchTokens = async (query) => {
    if (!query || query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:9000/api/search?query=${encodeURIComponent(query)}`
      );

      console.log("Search results:", response.data);
      setSearchResults(response.data.result || []);
    } catch (err) {
      console.error("Error searching tokens:", err);
      setError("Failed to search for tokens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input with debounce
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Create new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchTokens(query);
    }, 300); // 300ms debounce
  };

  // Handle search on form submit
  const handleSearch = (e) => {
    e.preventDefault();
    // Clear previous search results immediately
    setSearchResults([]);
    // Then perform the search
    searchTokens(searchQuery);
  };

  // Handle adding a token to dashboard
  const handleAddToken = (token) => {
    // Validate the token to make sure it has all required properties
    if (!token.tokenAddress) {
      console.error("Token missing required address property:", token);
      return;
    }

    // Add token to dashboard through the onAddToken prop
    onAddToken(token);

    // Close modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" // Increased max-width
      >
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Add Token</h2>
          <p className="text-gray-400 mt-1">
            Search for a token to add to your dashboard
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search by name, symbol, or address"
                className="bg-gray-800 text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={handleSearchInputChange}
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Search
              </button>
            </div>
          </form>

          {!searchQuery && !searchResults.length && (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-300">
                Search for Tokens
              </h3>
              <ul className="text-sm text-gray-400 mt-2">
                <li>• Search by token name (e.g. "TRUMP")</li>
                <li>• Search by token ticker (e.g. "WIF")</li>
                <li>• Search by contract address</li>
              </ul>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 max-h-96 overflow-y-auto">
              {" "}
              {/* Increased height */}
              {searchResults.map((token) => (
                <div
                  key={token.tokenAddress}
                  className="flex items-center justify-between p-4 hover:bg-gray-800 rounded-lg cursor-pointer mb-2"
                  onClick={() => handleAddToken(token)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Chain Logo */}
                    <img
                      src={getChainLogo(token.chainId)}
                      alt={token.chainId || "chain"}
                      className="w-5 h-5 rounded-full"
                      title={token.chainId}
                    />

                    {/* Token Logo & Info */}
                    <div className="flex items-center space-x-3 flex-1">
                      {token.logo && (
                        <img
                          src={token.logo}
                          alt={token.name}
                          className="w-8 h-8 rounded-full bg-gray-700 p-0.5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h4 className="font-medium text-white truncate">
                            {token.name}
                          </h4>
                          <span className="bg-gray-700 text-xs text-gray-300 px-2 py-0.5 rounded ml-2">
                            {token.symbol}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {token.tokenAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Token Metrics */}
                  <div className="flex flex-col items-end ml-2">
                    <div className="text-white font-medium">
                      {formatPrice(token.usdPrice)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-400">
                        MC: {formatMarketCap(token.marketCap)}
                      </span>
                      {token.usdPricePercentChange?.oneDay !== undefined && (
                        <span>
                          {formatPercentChange(
                            token.usdPricePercentChange.oneDay
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTokenModal;
