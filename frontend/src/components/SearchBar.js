import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const SearchBar = ({ onAddToken }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  // Clear search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    };

    // Return the logo path or default to Ethereum
    return chainMapping[normalizedChainId] || "/assets/chains/ethereum.svg";
  };

  // Format price
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
      setIsSearching(true);

      const response = await axios.get(
        `http://localhost:9000/api/search?query=${encodeURIComponent(query)}`
      );

      setSearchResults(response.data.result || []);
    } catch (err) {
      console.error("Error searching tokens:", err);
    } finally {
      setIsSearching(false);
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

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    searchTokens(searchQuery);
  };

  // Handle adding a token
  const handleAddToken = (token) => {
    if (onAddToken) {
      onAddToken(token);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  // Truncate address for display
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="mb-6 relative">
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          placeholder="Search: TCKR, 0x000101010101"
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="w-full p-3 rounded-l bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-gray-700 text-white p-3 rounded-r border border-gray-700 border-l-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && searchQuery.trim() !== "" && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-1 w-full bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto border border-gray-700"
        >
          {searchResults.map((token) => (
            <div
              key={token.tokenAddress}
              className="flex items-center justify-between p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
              onClick={() => handleAddToken(token)}
            >
              <div className="flex items-center space-x-3 flex-1">
                {/* Chain Logo */}
                <img
                  src={getChainLogo(token.chainId)}
                  alt={token.chainId || "chain"}
                  className="w-5 h-5 rounded-full"
                  title={token.chainId}
                  onError={(e) => {
                    e.target.src = "/assets/chains/ethereum.svg";
                  }}
                />

                {/* Token Logo & Info */}
                <div className="flex items-center space-x-3 flex-1">
                  {token.logo && (
                    <img
                      src={token.logo}
                      alt={token.name}
                      className="w-8 h-8 rounded-full bg-gray-700 p-0.5"
                      onError={(e) => {
                        e.target.src = "/assets/placeholder.svg";
                      }}
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
                      {truncateAddress(token.tokenAddress)}
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
                      {formatPercentChange(token.usdPricePercentChange.oneDay)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      {isSearching && searchQuery.trim() !== "" && !searchResults.length && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 rounded-lg shadow-xl p-4 text-center border border-gray-700">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-2">View:</span>
            <select className="bg-gray-800 border border-gray-700 rounded p-2 text-sm">
              <option>Full</option>
              <option>Compact</option>
            </select>
          </div>

          <div className="flex items-center">
            <span className="mr-2">List:</span>
            <select className="bg-gray-800 border border-gray-700 rounded p-2 text-sm">
              <option>Default</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="flex items-center">
            <select className="bg-gray-800 border border-gray-700 rounded p-2 text-sm">
              <option>All Holders</option>
              <option>Top Holders</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
