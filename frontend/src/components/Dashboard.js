import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TokenCard from "./TokenCard";
import AddTokenModal from "./AddTokenModal";
import SearchBar from "./SearchBar";
import axios from "axios";

// Utility functions for localStorage handling
const storageAvailable = (type) => {
  try {
    const storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

const saveToStorage = (key, value) => {
  if (!storageAvailable("localStorage")) {
    console.warn("localStorage not available");
    return false;
  }

  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

const loadFromStorage = (key, defaultValue) => {
  if (!storageAvailable("localStorage")) {
    console.warn("localStorage not available");
    return defaultValue;
  }

  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    const parsedValue = JSON.parse(serializedValue);
    return parsedValue;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

const Dashboard = () => {
  // Use a constant for localStorage key to ensure consistency
  const STORAGE_KEY = "holderscan_tokens";
  const navigate = useNavigate();

  // Initialize state from localStorage or empty array
  const [tokens, setTokens] = useState(() => {
    return loadFromStorage(STORAGE_KEY, []);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trendingTokens, setTrendingTokens] = useState([]);
  const trendingContainerRef = useRef(null);

  // Save tokens to localStorage whenever tokens state changes
  useEffect(() => {
    // Don't save on initial render with empty tokens
    if (tokens.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveToStorage(STORAGE_KEY, tokens);
    }
  }, [tokens]);

  // Fetch trending tokens
  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/api/trending-tokens"
        );

        const trendingData = response.data.success
          ? response.data.data
          : response.data;

        setTrendingTokens(trendingData || []);
      } catch (err) {
        console.error("Error fetching trending tokens:", err);
      }
    };

    fetchTrendingTokens();
  }, []);

  // Auto-scroll effect for trending tokens
  useEffect(() => {
    if (trendingContainerRef.current && trendingTokens.length > 0) {
      const container = trendingContainerRef.current;

      // Set initial scroll position
      container.scrollLeft = 0;

      // Function to scroll
      const scroll = () => {
        // Get container width and total scroll width
        const containerWidth = container.clientWidth;
        const scrollWidth = container.scrollWidth;

        // Calculate scroll increment (small enough for smooth scrolling)
        const scrollIncrement = 1;

        // Calculate scroll duration
        const scrollDuration = 20; // ms between scroll steps

        // Scroll function that will be called repeatedly
        const startScrolling = () => {
          // If we've reached the end, reset to beginning
          if (container.scrollLeft >= scrollWidth - containerWidth) {
            container.scrollLeft = 0;
          } else {
            container.scrollLeft += scrollIncrement;
          }
        };

        // Set interval for continuous scrolling
        const intervalId = setInterval(startScrolling, scrollDuration);

        // Return cleanup function
        return () => clearInterval(intervalId);
      };

      // Start scrolling after a delay to let the component render properly
      const timerId = setTimeout(scroll, 1000);

      return () => clearTimeout(timerId);
    }
  }, [trendingTokens]);

  // Add a new token to the dashboard
  const handleAddToken = (token) => {
    if (!token || !token.tokenAddress) {
      console.error("Invalid token:", token);
      return;
    }

    setTokens((prevTokens) => {
      // Check if token already exists
      if (prevTokens.some((t) => t.tokenAddress === token.tokenAddress)) {
        console.log("Token already exists:", token.tokenAddress);
        return prevTokens;
      }

      // Add new token
      const newTokens = [...prevTokens, token];

      // Manually save to localStorage for immediate persistence
      saveToStorage(STORAGE_KEY, newTokens);

      return newTokens;
    });
  };

  // Remove a token from the dashboard
  const handleRemoveToken = (tokenAddress) => {
    setTokens((prevTokens) => {
      const newTokens = prevTokens.filter(
        (token) => token.tokenAddress !== tokenAddress
      );

      // Manually save to localStorage for immediate persistence
      saveToStorage(STORAGE_KEY, newTokens);

      return newTokens;
    });
  };

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

      // ... other chains ...
    };

    // Return the logo path or default to Ethereum
    return chainMapping[normalizedChainId] || "/assets/chains/ethereum.svg";
  };

  return (
    <div>
      {/* Trending Tokens Scrollbar - NOW ABOVE SEARCH */}
      {trendingTokens.length > 0 && (
        <div className="mb-4 overflow-hidden">
          <div
            ref={trendingContainerRef}
            className="flex space-x-2 overflow-x-auto scrollbar-hide"
            style={{
              scrollBehavior: "smooth",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="text-xs text-gray-400 flex items-center px-2 flex-shrink-0">
              Hot Tokens:
            </div>
            {trendingTokens.map((token) => (
              <div
                key={`${token.chainId}-${token.tokenAddress}`}
                onClick={() =>
                  navigate(`/token/${token.chainId}/${token.tokenAddress}`)
                }
                className="flex items-center bg-gray-800/50 hover:bg-gray-700/50 rounded-full px-2 py-1 cursor-pointer flex-shrink-0"
              >
                {/* Token Logo */}
                {token.logo ? (
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-5 h-5 rounded-full mr-1"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/20/2d3748/FFFFFF?text=${token.symbol?.charAt(
                        0
                      )}`;
                    }}
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center mr-1">
                    <span className="text-xs">{token.symbol?.charAt(0)}</span>
                  </div>
                )}

                {/* Token Symbol */}
                <span className="text-xs font-medium mr-1">{token.symbol}</span>

                {/* Chain Logo */}
                <img
                  src={getChainLogo(token.chainId)}
                  alt={token.chainId}
                  className="w-3.5 h-3.5"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar with token search functionality */}
      <SearchBar onAddToken={handleAddToken} />

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <TokenCard
            key={token.tokenAddress}
            token={token}
            onRemove={handleRemoveToken}
          />
        ))}

        {/* Add Token Card */}
        <div
          className="bg-gray-800 rounded-lg p-6 shadow-lg w-full mb-4 flex flex-col items-center justify-center cursor-pointer min-h-[300px]"
          onClick={() => setIsModalOpen(true)}
        >
          <h3 className="text-xl font-bold mb-4">Add Token</h3>
          <div className="text-blue-500 text-5xl">+</div>
        </div>
      </div>

      <AddTokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToken={handleAddToken}
      />

      {/* Global CSS for hiding scrollbars */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
