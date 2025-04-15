import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TokenCard from "./TokenCard";
import AddTokenModal from "./AddTokenModal";
import SearchBar from "./SearchBar";
import TrendingTokensScroller from "./TrendingTokensScroller";
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
} from "../utils/localStorage";
import { getChainLogo } from "../utils/chainUtils";

const Dashboard = () => {
  // Use constant from localStorage utility
  const STORAGE_KEY = STORAGE_KEYS.TOKENS;
  const navigate = useNavigate();

  // Initialize state from localStorage or empty array
  const [tokens, setTokens] = useState(() => {
    return loadFromStorage(STORAGE_KEY, []);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Save tokens to localStorage whenever tokens state changes
  useEffect(() => {
    // Don't save on initial render with empty tokens
    if (tokens.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveToStorage(STORAGE_KEY, tokens);
    }
  }, [tokens]);

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

  return (
    <div>
      {/* Trending Tokens Scrollbar */}
      <TrendingTokensScroller className="mb-4" />

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
    </div>
  );
};

export default Dashboard;
