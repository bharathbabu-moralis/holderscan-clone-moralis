module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#1a1f2e", // Dark blue from HolderScan
        secondary: "#627eea", // Light blue accent
        accent: "#06b6d4", // Cyan accent
        success: "#10b981", // Green for positive changes
        danger: "#ef4444", // Red for negative changes
      },
    },
  },
  plugins: [],
};
