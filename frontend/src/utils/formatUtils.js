/**
 * Utility functions for formatting values
 */

/**
 * Truncate an Ethereum address to a shorter form
 * @param {string} address - The address to truncate
 * @returns {string} - The truncated address
 */
export const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format a number with commas and specified decimals
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} - The formatted number
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return "N/A";
  return Number(number).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a number as a percentage
 * @param {number} number - The number to format as percentage
 * @returns {string} - The formatted percentage
 */
export const formatPercent = (number) => {
  if (number === null || number === undefined) return "N/A";
  return `${Number(number).toFixed(2)}%`;
};

/**
 * Get the appropriate color for a change value
 * @param {number} value - The change value
 * @returns {string} - CSS color class: "positive", "negative", or "neutral"
 */
export const getChangeColor = (value) => {
  if (value === null || value === undefined) return "neutral";
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
};

/**
 * Format a price or percentage change
 * @param {number} change - The change value
 * @param {boolean} percent - Whether to format as percentage (default: true)
 * @returns {JSX.Element} - Formatted change with appropriate color
 */
export const formatChange = (change, percent = true) => {
  if (change === null || change === undefined)
    return <span className="neutral">N/A</span>;

  const className = getChangeColor(change);
  const prefix = change > 0 ? "+" : "";
  const value = percent
    ? `${prefix}${Math.abs(change).toFixed(2)}%`
    : `${prefix}$${Math.abs(change).toFixed(4)}`;

  return <span className={className}>{value}</span>;
};
