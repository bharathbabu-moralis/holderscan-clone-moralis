const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format numbers with commas and optional decimal places
const formatNumber = (number, decimals = 0) => {
  if (number === undefined || number === null) return "N/A";
  return parseFloat(number).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format percentages
const formatPercent = (number) => {
  if (number === undefined || number === null) return "N/A";
  return `${parseFloat(number).toFixed(2)}%`;
};

// Determine text color based on positive/negative value
const getChangeColor = (value) => {
  if (!value && value !== 0) return "text-gray-400";
  return value > 0
    ? "text-green-500"
    : value < 0
    ? "text-red-500"
    : "text-gray-400";
};

// Format change value with sign and color
const formatChange = (change, percent) => {
  if (change === undefined || percent === undefined) return "N/A";
  const sign = change > 0 ? "+" : "";
  return (
    <span className={getChangeColor(change)}>
      {sign}
      {formatNumber(change)} ({sign}
      {formatPercent(percent * 100)})
    </span>
  );
};

export { truncateAddress, formatNumber, formatPercent, formatChange };
