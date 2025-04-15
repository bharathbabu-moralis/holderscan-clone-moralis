import React, { useEffect, useState, useRef } from "react";
import { Chart, registerables } from "chart.js";
import axios from "axios";
import { Link } from "react-router-dom";
import { getChainLogo } from "../utils/chainUtils";
import API_BASE_URL from "../utils/apiConfig";

Chart.register(...registerables);

const TokenCard = ({ token, onRemove }) => {
  const [holderStats, setHolderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("1d");
  const [chartType, setChartType] = useState("bar");
  const [copied, setCopied] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const BAR_COUNT = 30; // Fixed number of bars to display

  // Map of intervals to their corresponding milliseconds
  const INTERVAL_MAP = {
    "1min": 60 * 1000,
    "5min": 5 * 60 * 1000,
    "10min": 10 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
    "1m": 30 * 24 * 60 * 60 * 1000,
  };

  // Copy token address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(token.tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch holder statistics
  useEffect(() => {
    const fetchHolderStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/holders/${token.chainId || "eth"}/${
            token.tokenAddress
          }`
        );
        setHolderStats(response.data);
        fetchHolderHistory(timeframe);
      } catch (err) {
        console.error("Error fetching holder stats:", err);
        setError("Failed to load holder statistics");
        setLoading(false);
      }
    };

    if (token) {
      fetchHolderStats();
    }
  }, [token]);

  // Fetch historical data for chart based on selected timeframe
  const fetchHolderHistory = async (selectedTimeframe) => {
    try {
      const today = new Date();
      let fromDate = new Date();
      let apiTimeFrame = selectedTimeframe;

      // Calculate fromDate based on the selected interval and BAR_COUNT
      const intervalMs = INTERVAL_MAP[selectedTimeframe] || INTERVAL_MAP["1d"];
      fromDate = new Date(today.getTime() - BAR_COUNT * intervalMs);

      const response = await axios.get(
        `${API_BASE_URL}/api/holders/${token.chainId || "eth"}/${
          token.tokenAddress
        }/historical`,
        {
          params: {
            fromDate: fromDate.toISOString(),
            toDate: today.toISOString(),
            timeFrame: apiTimeFrame,
          },
        }
      );

      // Make sure we're accessing the correct property structure
      const historyData = response.data.result || [];
      const limitedData = historyData.slice(-BAR_COUNT);

      createChart(limitedData, selectedTimeframe);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching holder history:", err);
      setError("Failed to load chart data");
      setLoading(false);
    }
  };

  // Update chart when timeframe changes
  useEffect(() => {
    if (holderStats) {
      fetchHolderHistory(timeframe);
    }
  }, [timeframe, chartType]);

  // Create chart with historical data
  const createChart = (historyData, selectedTimeframe) => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // Sort data chronologically (older to newer)
    const sortedData = [...historyData].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Prepare data for chart
    const timestamps = sortedData.map((item) => {
      const date = new Date(item.timestamp);

      if (
        selectedTimeframe === "1min" ||
        selectedTimeframe === "5min" ||
        selectedTimeframe === "10min" ||
        selectedTimeframe === "30min"
      ) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (
        selectedTimeframe === "1h" ||
        selectedTimeframe === "4h" ||
        selectedTimeframe === "12h"
      ) {
        return `${date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })} ${date.toLocaleTimeString([], { hour: "2-digit" })}`;
      } else if (selectedTimeframe === "1d") {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      } else if (selectedTimeframe === "1w" || selectedTimeframe === "1m") {
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      return date.toLocaleDateString();
    });

    const holderCounts = sortedData.map((item) =>
      parseInt(item.totalHolders || 0, 10)
    );

    // Calculate min and max values for better scale visibility
    let minValue = Math.min(...holderCounts);
    let maxValue = Math.max(...holderCounts);

    // Make the scale more balanced
    const range = maxValue - minValue;

    if (range > 0) {
      // Use a balanced approach for minimum
      const scalingFactor = 0.175; // 17.5%
      minValue = Math.max(0, minValue - range * scalingFactor);

      // Adjust max value slightly for headroom
      maxValue = maxValue + range * 0.05;
    }

    // Single color for all chart elements
    const chartColor = "rgba(105, 128, 200, 0.8)";

    // Point configurations based on chart type
    const pointRadius = chartType === "line" ? 2 : 0;
    const pointHoverRadius = chartType === "line" ? 5 : 0;

    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: timestamps,
        datasets: [
          {
            data: holderCounts,
            backgroundColor: chartColor,
            borderColor: chartColor,
            borderWidth: chartType === "line" ? 2 : 1,
            pointRadius: pointRadius,
            pointHoverRadius: pointHoverRadius,
            pointBackgroundColor: chartColor,
            pointHoverBackgroundColor: "#ffffff",
            pointBorderColor: chartColor,
            pointHoverBorderColor: chartColor,
            pointBorderWidth: 1,
            pointHitRadius: 10, // Increased hit area for better hover detection
            fill: chartType === "line",
            tension: 0.3, // Slight curve for line chart
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: chartType === "line" ? "index" : "nearest", // Better hover mode for line chart
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: "#1f2937",
            titleColor: "#e5e7eb",
            bodyColor: "#e5e7eb",
            borderColor: "#374151",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
            displayColors: false, // Remove color box in tooltip
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return timestamps[index];
              },
              label: (context) => {
                // Format number with commas
                const value = context.raw;
                return `Holders: ${value.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: false,
            ticks: {
              display: false,
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
          y: {
            display: false,
            min: minValue,
            max: maxValue,
            ticks: {
              display: false,
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
        },
      },
    });
  };

  // Get available timeframes based on API response
  const getAvailableTimeframes = () => {
    if (!holderStats || !holderStats.holderChange) return [];

    return Object.keys(holderStats.holderChange);
  };

  // All supported intervals from the API
  const getAllTimeframes = () => [
    "1min",
    "5min",
    "10min",
    "30min",
    "1h",
    "4h",
    "12h",
    "1d",
    "1w",
    "1m",
  ];

  // Display friendly name for timeframes
  const getTimeframeLabel = (interval) => {
    const labels = {
      "1min": "1 Minute",
      "5min": "5 Minutes",
      "10min": "10 Minutes",
      "30min": "30 Minutes",
      "1h": "1 Hour",
      "4h": "4 Hours",
      "12h": "12 Hours",
      "1d": "1 Day",
      "1w": "1 Week",
      "1m": "1 Month",
    };
    return labels[interval] || interval;
  };

  // Truncate address for display
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 shadow-lg w-full mb-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 shadow-lg w-full mb-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg w-full mb-4">
      {/* Header Section with Token Info - ENLARGED */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {/* Chain Logo */}
          <img
            src={getChainLogo(token.chainId)}
            alt={token.chainId || "eth"}
            className="w-8 h-8"
          />

          {/* Token Logo & Symbol */}
          <div className="flex items-center">
            {token.logo && (
              <img
                src={token.logo}
                alt={token.name}
                className="w-10 h-10 mr-3 rounded-full bg-gray-800 p-1"
              />
            )}
            <div>
              <Link
                to={`/token/${token.chainId || "eth"}/${token.tokenAddress}`}
                className="font-medium hover:text-blue-400"
              >
                {token.symbol}
              </Link>
              <div className="text-xs text-gray-400">{token.name}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Copy Address Button */}
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-white transition-colors text-base bg-gray-800 px-3 py-1.5 rounded flex items-center"
            title={token.tokenAddress}
          >
            <span className="mr-1">{truncateAddress(token.tokenAddress)}</span>
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={() => onRemove(token.tokenAddress)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Remove token"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {holderStats && (
        <>
          {/* Holders Count */}
          <div className="text-center mb-4">
            <h4 className="text-gray-400 normal">Holders</h4>
            <p className="text-4xl font-semibold text-indigo-300">
              {holderStats.totalHolders?.toLocaleString()}
            </p>
          </div>

          {/* Timeframe Stats - SMALLER */}
          <div className="mb-4 px-2">
            {getAvailableTimeframes().map((interval) => (
              <div
                key={interval}
                className="flex justify-between items-center py-0.5 border-b border-gray-800"
              >
                <span className="text-gray-300 normal">
                  {getTimeframeLabel(interval)}
                </span>
                <span
                  className={`${
                    holderStats.holderChange[interval]?.change >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  } normal`}
                >
                  {holderStats.holderChange[interval]?.change >= 0 ? "+" : ""}
                  {holderStats.holderChange[interval]?.change}/
                  {holderStats.holderChange[interval]?.changePercent}%
                </span>
              </div>
            ))}
          </div>

          {/* Timeframe Selector & Chart Type Toggle */}
          <div className="flex justify-center mb-2">
            <div className="relative inline-block">
              <select
                className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                {getAllTimeframes().map((interval) => (
                  <option key={interval} value={interval}>
                    {getTimeframeLabel(interval)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Chart Type Toggle */}
            <div className="ml-3 flex bg-gray-800 rounded overflow-hidden">
              <button
                className={`text-xs px-2 py-1 ${
                  chartType === "bar"
                    ? "bg-indigo-600 text-white"
                    : "bg-transparent text-gray-400 hover:text-white"
                }`}
                onClick={() => setChartType("bar")}
              >
                Bar
              </button>
              <button
                className={`text-xs px-2 py-1 ${
                  chartType === "line"
                    ? "bg-indigo-600 text-white"
                    : "bg-transparent text-gray-400 hover:text-white"
                }`}
                onClick={() => setChartType("line")}
              >
                Line
              </button>
            </div>
          </div>
        </>
      )}

      {/* Chart - ENLARGED */}
      <div className="mt-4 h-40">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default TokenCard;
