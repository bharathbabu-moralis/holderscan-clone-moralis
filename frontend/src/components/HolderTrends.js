// src/components/HolderTrends.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HolderTrends = () => {
  const [holderTrends, setHolderTrends] = useState({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHolderTrends = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:9000/api/trends");
        setHolderTrends(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching holder trends:", err);
        setError("Failed to load holder trends");
        setLoading(false);
      }
    };

    fetchHolderTrends();
  }, []);

  // Helper to render network icon using SVG icons
  const renderNetworkIcon = (network) => {
    // Normalize the network name
    const normalizedNetwork = (network || "").toString().toLowerCase();

    // Chain icon mapping
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
      sol: "/assets/chains/solana.svg",

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

    // Get icon path or default to Ethereum
    const iconPath =
      chainMapping[normalizedNetwork] || "/assets/chains/ethereum.svg";

    // Chain name display mapping
    const chainNameMapping = {
      // Ethereum
      eth: "ETH",
      ethereum: "ETH",
      "0x1": "ETH",
      1: "ETH",

      // Binance Smart Chain
      bsc: "BSC",
      binance: "BSC",
      "0x38": "BSC",
      56: "BSC",

      // Polygon
      polygon: "MATIC",
      matic: "MATIC",
      "0x89": "MATIC",
      137: "MATIC",

      // Solana
      solana: "SOL",
      sol: "SOL",

      // Avalanche
      avalanche: "AVAX",
      avax: "AVAX",
      "0xa86a": "AVAX",
      43114: "AVAX",

      // Fantom
      fantom: "FTM",
      ftm: "FTM",
      "0xfa": "FTM",
      250: "FTM",

      // Arbitrum
      arbitrum: "ARB",
      "0xa4b1": "ARB",
      42161: "ARB",

      // Optimism
      optimism: "OP",
      "0xa": "OP",
      10: "OP",

      // Base
      base: "BASE",
      "0x2105": "BASE",
      8453: "BASE",

      // Linea
      linea: "LINEA",
      "0xe708": "LINEA",

      // Pulse
      pulse: "PULSE",
      "0x171": "PULSE",

      // Ronin
      ronin: "RONIN",
      "0x7e4": "RONIN",
    };

    // Get chain name or default to ETH if unrecognized
    const chainName = chainNameMapping[normalizedNetwork] || "ETH";

    return (
      <div className="flex items-center justify-end w-full">
        <img
          src={iconPath}
          alt={chainName}
          className="w-4 h-4 mr-1"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/chains/ethereum.svg"; // Fallback to ETH logo
          }}
        />
        <span className="text-xs text-gray-300">{chainName}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-primary rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-secondary rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="h-5 bg-secondary rounded w-1/3"></div>
            <div className="h-8 bg-secondary rounded"></div>
            <div className="h-8 bg-secondary rounded"></div>
            <div className="h-8 bg-secondary rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-5 bg-secondary rounded w-1/3"></div>
            <div className="h-8 bg-secondary rounded"></div>
            <div className="h-8 bg-secondary rounded"></div>
            <div className="h-8 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-primary rounded-lg">{error}</div>
    );
  }

  return (
    <div className="bg-primary rounded-lg p-4">
      <h2 className="text-base font-bold mb-4 border-b border-gray-700 pb-1">
        Holder Trends
      </h2>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gainers */}
        <div>
          <h3 className="text-sm font-bold mb-3">
            <span className="border-b border-gray-700 pb-1">
              Biggest Gainers
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 tracking-wider">
                    Token
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                    Holders
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                    24h
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                    Network
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {holderTrends.gainers.map((token, index) => (
                  <tr key={index} className="hover:bg-gray-800/20">
                    <td className="px-2 py-2 whitespace-nowrap">
                      <Link
                        to={`/token/${token.chainId || "eth"}/${
                          token.tokenAddress
                        }`}
                        className="flex items-center"
                      >
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-2 overflow-hidden">
                          {token.logo ? (
                            <img
                              src={token.logo}
                              alt={token.symbol}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/24/2d3748/FFFFFF?text=${token.symbol?.charAt(
                                  0
                                )}`;
                              }}
                            />
                          ) : (
                            <span className="text-xs">
                              {token.symbol?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-xs text-white">
                            {token.symbol}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[80px]">
                            {token.name?.substring(0, 12)}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right text-gray-300 text-xs">
                      {token.holderStats.totalHolders.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right text-xs">
                      <span className="text-green-500">
                        +{token.holderStats.holderChange["24h"].change}
                        <span className="ml-1">
                          (
                          {token.holderStats.holderChange[
                            "24h"
                          ].changePercent.toFixed(2)}
                          %)
                        </span>
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      {renderNetworkIcon(token.chainId)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Losers */}
        <div>
          <h3 className="text-sm font-bold mb-3">
            <span className="border-b border-gray-700 pb-1">
              Biggest Losers
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 tracking-wider">
                    Token
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                    Holders
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                    24h
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-400 tracking-wider">
                    Network
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {holderTrends.losers.map((token, index) => (
                  <tr key={index} className="hover:bg-gray-800/20">
                    <td className="px-2 py-2 whitespace-nowrap">
                      <Link
                        to={`/token/${token.chainId || "eth"}/${
                          token.tokenAddress
                        }`}
                        className="flex items-center"
                      >
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-2 overflow-hidden">
                          {token.logo ? (
                            <img
                              src={token.logo}
                              alt={token.symbol}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/24/2d3748/FFFFFF?text=${token.symbol?.charAt(
                                  0
                                )}`;
                              }}
                            />
                          ) : (
                            <span className="text-xs">
                              {token.symbol?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-xs text-white">
                            {token.symbol}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[80px]">
                            {token.name?.substring(0, 12)}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right text-gray-300 text-xs">
                      {token.holderStats.totalHolders.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right text-xs">
                      <span className="text-red-500">
                        {token.holderStats.holderChange["24h"].change}
                        <span className="ml-1">
                          (
                          {token.holderStats.holderChange[
                            "24h"
                          ].changePercent.toFixed(2)}
                          %)
                        </span>
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      {renderNetworkIcon(token.chainId)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolderTrends;
