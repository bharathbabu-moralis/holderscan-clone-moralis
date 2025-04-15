// API configuration utility
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

export const getApiUrl = (endpoint) => {
  // Make sure endpoint doesn't start with a slash
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint;
  return `${API_BASE_URL}/${formattedEndpoint}`;
};

export default API_BASE_URL;
