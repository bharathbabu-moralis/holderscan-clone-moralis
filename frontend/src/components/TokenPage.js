import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { PriceChartWidget } from "./PriceChartWidget";
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
} from "../utils/localStorage";
import TrendingTokensScroller from "./TrendingTokensScroller";
import { getChainLogo } from "../utils/chainUtils";
import {
  truncateAddress,
  formatNumber,
  formatPercent,
  formatChange,
} from "../utils/formatUtils";

const TokenPage = () => {
  const { chain, address } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [holders, setHolders] = useState([]);
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [holdersLoading, setHoldersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Use constant from localStorage utility
  const STORAGE_KEY = STORAGE_KEYS.TOKENS;

  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Click outside handler for search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if token is already favorited
  useEffect(() => {
    if (tokenData) {
      const savedTokens = loadFromStorage(STORAGE_KEY, []);
      const isAlreadyFavorite = savedTokens.some(
        (token) => token.tokenAddress === address && token.chainId === chain
      );
      setIsFavorite(isAlreadyFavorite);
    }
  }, [tokenData, chain, address]);

  // Fetch token data
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        let tokenMetadata;

        if (chain === "solana") {
          const response = await axios.get(
            `http://localhost:9000/api/token/solana/${address}/metadata`
          );
          // Extract the data from the nested structure
          tokenMetadata = response.data.success
            ? response.data.data
            : response.data;
          console.log("Solana token metadata:", tokenMetadata);
        } else {
          const response = await axios.get(
            `http://localhost:9000/api/token/evm/metadata`,
            {
              params: { chain, address },
            }
          );

          // Handle the response based on its structure
          let responseData = response.data.success
            ? response.data.data
            : response.data;

          // Check if the response is an array and get the first item
          tokenMetadata = Array.isArray(responseData)
            ? responseData[0]
            : responseData;

          console.log("EVM token metadata:", tokenMetadata);
        }

        // Fetch holder stats for the token
        const holderStatsResponse = await axios.get(
          `http://localhost:9000/api/holders/${chain}/${address}`
        );

        const holderStats = holderStatsResponse.data.success
          ? holderStatsResponse.data.data
          : holderStatsResponse.data;

        console.log("Holder stats:", holderStats);

        setTokenData({
          ...tokenMetadata,
          holderStats: holderStats,
          chainId: chain,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError("Failed to load token information");
        setLoading(false);
      }
    };

    if (chain && address) {
      fetchTokenData();
    }
  }, [chain, address]);

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

  // Updated search function with console logging
  const searchTokens = async (query) => {
    if (!query || query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      console.log("Searching for:", query);

      const response = await axios.get(
        `http://localhost:9000/api/search?query=${encodeURIComponent(query)}`
      );

      console.log("Search response:", response.data);
      const results = response.data.result || [];

      setSearchResults(results);
      setShowSearchResults(true);
      console.log("Search results set:", results.length);
    } catch (err) {
      console.error("Error searching tokens:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
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

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchQuery.trim() !== "" && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  // Handle token selection from search
  const handleTokenSelect = (token) => {
    navigate(`/token/${token.chainId}/${token.tokenAddress}`);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Add new effect to fetch holders data for EVM chains
  useEffect(() => {
    const fetchHolders = async () => {
      // Only fetch holders for EVM chains
      if (chain !== "solana" && address) {
        try {
          setHoldersLoading(true);
          const response = await axios.get(
            `http://localhost:9000/api/token/${chain}/${address}/owners`
          );

          const holderData = response.data.success
            ? response.data.data
            : response.data;

          setHolders(holderData.result || []);
          setHoldersLoading(false);
        } catch (err) {
          console.error("Error fetching holders:", err);
          setHoldersLoading(false);
        }
      }
    };

    if (!loading && tokenData) {
      fetchHolders();
    }
  }, [loading, tokenData, chain, address]);

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!tokenData) return;

    const savedTokens = loadFromStorage(STORAGE_KEY, []);

    // If already a favorite, remove it
    if (isFavorite) {
      const updatedTokens = savedTokens.filter(
        (token) => !(token.tokenAddress === address && token.chainId === chain)
      );
      saveToStorage(STORAGE_KEY, updatedTokens);
      setIsFavorite(false);
    }
    // Otherwise add it
    else {
      // Create token object with the required fields for Dashboard
      const tokenForStorage = {
        tokenAddress: isSolana ? tokenData.mint : address,
        chainId: chain,
        name: tokenData.name || "",
        symbol: tokenData.symbol || "",
        logo: tokenData.logo || "",
        decimals: tokenData.decimals || "0",
        // Add any other fields needed for display in Dashboard
      };

      // Add to storage if not already there
      if (
        !savedTokens.some(
          (t) =>
            t.tokenAddress === tokenForStorage.tokenAddress &&
            t.chainId === chain
        )
      ) {
        const updatedTokens = [...savedTokens, tokenForStorage];
        saveToStorage(STORAGE_KEY, updatedTokens);
      }
      setIsFavorite(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary animate-pulse">
        <div className="container mx-auto p-4">
          <div className="h-16 bg-primary rounded mb-6"></div>
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/3 pr-0 md:pr-4 space-y-4">
              <div className="h-48 bg-primary rounded"></div>
              <div className="h-48 bg-primary rounded"></div>
            </div>
            <div className="w-full md:w-2/3 h-[700px] bg-primary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary p-4">
        <div className="max-w-7xl mx-auto bg-secondary rounded-lg p-6">
          <div className="text-red-500">{error}</div>
          <Link
            to="/"
            className="mt-4 inline-block text-accent hover:text-accent/80"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-primary p-4">
        <div className="max-w-7xl mx-auto bg-secondary rounded-lg p-6">
          <div>No data found for this token</div>
          <Link
            to="/"
            className="mt-4 inline-block text-accent hover:text-accent/80"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Determine if this is a Solana token
  const isSolana = chain === "solana";

  // Get token name and symbol based on token type
  const tokenName = isSolana
    ? tokenData.name
    : tokenData.name || tokenData.address_label;
  const tokenSymbol = tokenData.symbol;

  // Get token logo
  const tokenLogo = tokenData.logo;

  // Get total supply (normalized for both types)
  const totalSupply = isSolana
    ? tokenData.totalSupplyFormatted
    : tokenData.total_supply_formatted;

  // Get market cap value based on token type
  const marketCap = isSolana
    ? tokenData.fullyDilutedValue
    : tokenData.market_cap || tokenData.fully_diluted_valuation;

  // Get token description
  const description = tokenData.description;

  // Get token links
  const links = tokenData.links || {};

  return (
    <div className="min-h-screen bg-primary text-white">
      <div className="container mx-auto p-4">
        {/* Top search section with trending tokens */}
        <div className="mb-8 flex items-center">
          {/* Search Input */}
          <div className="relative mr-4">
            <div className="relative w-96 flex-shrink-0 z-50">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search: TCKR, 0x000101010101"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchFocus}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {/* Search icon or loading spinner */}
              <div className="absolute right-3 top-3.5 text-gray-400">
                {searchLoading ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
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
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div
                  ref={searchResultsRef}
                  className="absolute mt-2 w-full bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto border border-gray-700"
                  style={{ zIndex: 100 }}
                >
                  {searchResults.map((token) => (
                    <div
                      key={`${token.chainId}-${token.tokenAddress}`}
                      className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                      onClick={() => handleTokenSelect(token)}
                    >
                      {/* Chain Logo */}
                      <img
                        src={getChainLogo(token.chainId)}
                        alt={token.chainId || "chain"}
                        className="w-5 h-5 rounded-full mr-2"
                        onError={(e) => {
                          e.target.src = "/assets/chains/ethereum.svg";
                        }}
                      />

                      {/* Token Logo */}
                      {token.logo ? (
                        <img
                          src={token.logo}
                          alt={token.name}
                          className="w-8 h-8 rounded-full bg-gray-700 mr-3"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/32/2d3748/FFFFFF?text=${token.symbol?.charAt(
                              0
                            )}`;
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                          <span className="text-xs">
                            {token.symbol?.charAt(0)}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="font-medium text-sm truncate">
                            {token.name}
                          </h3>
                          <span className="ml-2 text-xs text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded">
                            {token.symbol}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {truncateAddress(token.tokenAddress)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trending Tokens - Auto-scrolling bar with HIDDEN SCROLLBAR */}
          <TrendingTokensScroller className="flex-1" />
        </div>

        <div className="flex flex-wrap">
          {/* Left Column: Token info and details - now 1/4 width */}
          <div className="w-full md:w-1/4 pr-0 md:pr-5">
            {/* Token Header with Favorite Button */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mr-3 overflow-hidden">
                  {tokenLogo ? (
                    <img
                      src={tokenLogo}
                      alt={tokenSymbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/48/2d3748/FFFFFF?text=${tokenSymbol?.charAt(
                          0
                        )}`;
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold">
                      {tokenSymbol?.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold flex items-center">
                    {tokenName}
                    <span className="ml-2 text-gray-400 font-normal">
                      {tokenSymbol}
                    </span>
                    <img
                      src={getChainLogo(chain)}
                      alt={chain}
                      className="w-4 h-4 ml-2"
                    />
                  </h1>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-400 mr-2">
                      {truncateAddress(
                        isSolana ? tokenData.mint : tokenData.address || address
                      )}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          isSolana
                            ? tokenData.mint
                            : tokenData.address || address
                        );
                      }}
                      className="text-xs text-accent hover:text-accent/80"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Favorite Button */}
              <button
                onClick={toggleFavorite}
                className={`rounded-full p-2 transition-colors focus:outline-none ${
                  isFavorite
                    ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                }`}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={isFavorite ? "0" : "2"}
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>
            </div>

            {/* Links - Moved to top */}
            {Object.keys(links).length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-bold mb-2">
                  <span className="border-b border-gray-700 pb-1">Links</span>
                </h2>
                <div className="flex flex-wrap gap-2 text-sm">
                  {/* Moralis link - shown first/by default */}
                  {links.moralis && (
                    <a
                      href={links.moralis}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 px-2 py-0.5 rounded text-xs transition-colors"
                    >
                      Moralis
                    </a>
                  )}

                  {/* Website link */}
                  {links.website && (
                    <a
                      href={links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-accent/30 text-accent hover:bg-accent/10 px-2 py-0.5 rounded text-xs transition-colors"
                    >
                      Website
                    </a>
                  )}

                  {/* Twitter link */}
                  {links.twitter && (
                    <a
                      href={links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-blue-400/30 text-blue-400 hover:bg-blue-400/10 px-2 py-0.5 rounded text-xs transition-colors"
                    >
                      Twitter
                    </a>
                  )}

                  {/* GitHub link */}
                  {links.github && (
                    <a
                      href={links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-400/30 text-gray-400 hover:bg-gray-400/10 px-2 py-0.5 rounded text-xs transition-colors"
                    >
                      GitHub
                    </a>
                  )}

                  {/* Telegram link */}
                  {links.telegram && (
                    <a
                      href={links.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-blue-400/30 text-blue-400 hover:bg-blue-400/10 px-2 py-0.5 rounded text-xs transition-colors"
                    >
                      Telegram
                    </a>
                  )}

                  {/* Reddit link */}
                  {links.reddit && (
                    <a
                      href={links.reddit}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-orange-400/30 text-orange-400 hover:bg-orange-400/10 px-2 py-0.5 rounded text-xs transition-colors"
                    >
                      Reddit
                    </a>
                  )}

                  {/* Email link */}
                  {links.email && (
                    <a
                      href={`mailto:${links.email}`}
                      className="border border-green-500/30 text-green-400 hover:bg-green-500/10 px-2 py-0.5 rounded text-xs transition-colors"
                    >
                      Email
                    </a>
                  )}

                  {/* Facebook link */}
                  {links.facebook && (
                    <a
                      href={links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-blue-600/30 text-blue-500 hover:bg-blue-600/10 px-2 py-0.5 rounded text-xs transition-colors"
                    >
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-sm font-bold mb-2">
                <span className="border-b border-gray-700 pb-1">
                  Token Details
                </span>
              </h2>
              <div className="space-y-0.5 text-sm">
                {/* Chain */}
                <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                  <div className="text-gray-400">Chain:</div>
                  <div className="flex items-center">
                    <img
                      src={getChainLogo(chain)}
                      alt={chain}
                      className="w-3.5 h-3.5 mr-1"
                    />
                    <span>{chain.toUpperCase()}</span>
                  </div>
                </div>

                {/* Name */}
                <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                  <div className="text-gray-400">Name:</div>
                  <div>{tokenName}</div>
                </div>

                {/* Symbol */}
                <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                  <div className="text-gray-400">Symbol:</div>
                  <div>{tokenSymbol}</div>
                </div>

                {/* Total Supply */}
                <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                  <div className="text-gray-400">Total Supply:</div>
                  <div>{formatNumber(totalSupply, 2)}</div>
                </div>

                {/* Market Cap */}
                <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                  <div className="text-gray-400">
                    {isSolana ? "Fully Diluted Value:" : "Market Cap:"}
                  </div>
                  <div>${formatNumber(marketCap, 2)}</div>
                </div>

                {/* Decimals */}
                <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                  <div className="text-gray-400">Decimals:</div>
                  <div>{tokenData.decimals}</div>
                </div>

                {/* Circulating Supply (if available) */}
                {!isSolana && tokenData.circulating_supply && (
                  <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                    <div className="text-gray-400">Circulating Supply:</div>
                    <div>{formatNumber(tokenData.circulating_supply, 2)}</div>
                  </div>
                )}

                {/* Created At (if available) */}
                {tokenData.created_at && (
                  <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                    <div className="text-gray-400">Created At:</div>
                    <div>
                      {new Date(tokenData.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Security Score (if available) */}
                {!isSolana && tokenData.security_score !== undefined && (
                  <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                    <div className="text-gray-400">Security Score:</div>
                    <div>{tokenData.security_score}/100</div>
                  </div>
                )}

                {/* Verified Contract (if available) */}
                {!isSolana && tokenData.verified_contract && (
                  <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                    <div className="text-gray-400">Verified Contract:</div>
                    <div>
                      <span className="bg-success/20 text-success text-xs px-2 py-0.5 rounded-full font-medium">
                        Verified
                      </span>
                    </div>
                  </div>
                )}

                {/* Total Holders */}
                <div className="flex justify-between py-1.5 border-b border-gray-700 border-dotted">
                  <div className="text-gray-400">Total Holders:</div>
                  <div>{formatNumber(tokenData.holderStats?.totalHolders)}</div>
                </div>
              </div>
            </div>

            {/* Holder Trends Section */}
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-2">
                <span className="border-b border-gray-700 pb-1">
                  Holder Trends
                </span>
              </h2>
              <div className="space-y-1 text-sm">
                {tokenData.holderStats?.holderChange &&
                  Object.entries(tokenData.holderStats.holderChange).map(
                    ([timeframe, data]) => (
                      <div
                        key={timeframe}
                        className="flex justify-between py-1.5"
                      >
                        <div className="text-gray-400">{timeframe}:</div>
                        <div>
                          {formatChange(data.change, data.changePercent)}
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>

            {/* Solana-specific: Holder Distribution */}
            {isSolana && tokenData.holderStats?.holderDistribution && (
              <div className="mb-4">
                <h2 className="text-sm font-bold mb-2">
                  <span className="border-b border-gray-700 pb-1">
                    Holder Distribution
                  </span>
                </h2>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Whales:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderDistribution.whales
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Sharks:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderDistribution.sharks
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Dolphins:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderDistribution.dolphins
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Fish:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderDistribution.fish
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Octopus:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderDistribution.octopus
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Crabs:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderDistribution.crabs
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Shrimps:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderDistribution.shrimps
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EVM-specific: Holder Supply Distribution */}
            {!isSolana && tokenData.holderStats?.holderSupply && (
              <div className="mb-4">
                <h2 className="text-sm font-bold mb-2">
                  <span className="border-b border-gray-700 pb-1">
                    Supply Distribution
                  </span>
                </h2>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Top 10 Holders:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderSupply.top10.supply,
                        2
                      )}{" "}
                      (
                      {formatPercent(
                        tokenData.holderStats.holderSupply.top10.supplyPercent
                      )}
                      )
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Top 25 Holders:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderSupply.top25.supply,
                        2
                      )}{" "}
                      (
                      {formatPercent(
                        tokenData.holderStats.holderSupply.top25.supplyPercent
                      )}
                      )
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Top 50 Holders:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderSupply.top50.supply,
                        2
                      )}{" "}
                      (
                      {formatPercent(
                        tokenData.holderStats.holderSupply.top50.supplyPercent
                      )}
                      )
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Top 100 Holders:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderSupply.top100.supply,
                        2
                      )}{" "}
                      (
                      {formatPercent(
                        tokenData.holderStats.holderSupply.top100.supplyPercent
                      )}
                      )
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Top 250 Holders:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderSupply.top250.supply,
                        2
                      )}{" "}
                      (
                      {formatPercent(
                        tokenData.holderStats.holderSupply.top250.supplyPercent
                      )}
                      )
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Top 500 Holders:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holderSupply.top500.supply,
                        2
                      )}{" "}
                      (
                      {formatPercent(
                        tokenData.holderStats.holderSupply.top500.supplyPercent
                      )}
                      )
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW SECTION: Holder Acquisition */}
            {tokenData.holderStats?.holdersByAcquisition && (
              <div className="mb-4">
                <h2 className="text-sm font-bold mb-2">
                  <span className="border-b border-gray-700 pb-1">
                    Holder Acquisition
                  </span>
                </h2>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Swap:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holdersByAcquisition.swap
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Transfer:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holdersByAcquisition.transfer
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-400">Airdrop:</div>
                    <div>
                      {formatNumber(
                        tokenData.holderStats.holdersByAcquisition.airdrop
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back Button - moved to bottom for mobile view */}
          </div>

          {/* Right Column: Price Chart - now 3/4 width and starts from top */}
          <div className="w-full md:w-3/4 md:pl-2">
            {/* Add a larger, more prominent floating favorite button for mobile */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
              <button
                onClick={toggleFavorite}
                className={`rounded-full p-3 shadow-lg transition-colors focus:outline-none ${
                  isFavorite
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={isFavorite ? "0" : "2"}
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>
            </div>

            {/* Chart with favorite button for desktop */}
            <div className="relative">
              {/* Favorite button for desktop display in chart corner */}
              <div className="absolute top-2 right-2 z-10 hidden md:block">
                <button
                  onClick={toggleFavorite}
                  className={`rounded-full p-2 transition-colors focus:outline-none ${
                    isFavorite
                      ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                  }`}
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                  title={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={isFavorite ? "0" : "2"}
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </button>
              </div>

              {/* Chart - INCREASED HEIGHT */}
              <div className="h-[calc(100vh-180px)] min-h-[650px] mb-4">
                <PriceChartWidget />
              </div>
            </div>

            {/* Holders Table - Only for EVM tokens */}
            {!isSolana && (
              <div className="mt-4">
                <h2 className="text-sm font-bold mb-3">
                  <span className="border-b border-gray-700 pb-1">
                    Top Holders
                  </span>
                </h2>

                {holdersLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-secondary rounded w-full"></div>
                    <div className="h-10 bg-secondary rounded w-full"></div>
                    <div className="h-10 bg-secondary rounded w-full"></div>
                    <div className="h-10 bg-secondary rounded w-full"></div>
                  </div>
                ) : holders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700 text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 tracking-wider">
                            #
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Address
                          </th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                            Balance
                          </th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                            Value (USD)
                          </th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                            % Supply
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {holders.slice(0, 10).map((holder, index) => (
                          <tr
                            key={holder.owner_address}
                            className="hover:bg-gray-800/20"
                          >
                            <td className="px-2 py-2 whitespace-nowrap text-gray-300">
                              {index + 1}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                {holder.is_contract && (
                                  <span className="mr-1 text-xs bg-blue-900/30 text-blue-400 px-1 rounded">
                                    Contract
                                  </span>
                                )}
                                <span className="text-gray-300">
                                  {holder.owner_address_label ? (
                                    <span className="text-accent">
                                      {holder.owner_address_label}
                                    </span>
                                  ) : (
                                    truncateAddress(holder.owner_address)
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-right text-gray-300">
                              {formatNumber(holder.balance_formatted, 4)}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-right text-gray-300">
                              ${formatNumber(holder.usd_value, 2)}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-right text-gray-300">
                              {holder.percentage_relative_to_total_supply.toFixed(
                                2
                              )}
                              %
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    No holder data available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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

export default TokenPage;
