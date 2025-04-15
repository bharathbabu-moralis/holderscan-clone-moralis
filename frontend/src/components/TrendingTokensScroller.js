import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getChainLogo } from "../utils/chainUtils";

const TrendingTokensScroller = ({ className = "" }) => {
  const [trendingTokens, setTrendingTokens] = useState([]);
  const trendingContainerRef = useRef(null);
  const navigate = useNavigate();

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

  // Handle trending token click
  const handleTokenClick = (token) => {
    navigate(`/token/${token.chainId}/${token.tokenAddress}`);
  };

  if (trendingTokens.length === 0) {
    return null;
  }

  return (
    <div className={`overflow-hidden ${className}`}>
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
            onClick={() => handleTokenClick(token)}
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

export default TrendingTokensScroller;
