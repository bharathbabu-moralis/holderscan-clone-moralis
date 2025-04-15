// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#13151f", // Dark background color
        secondary: "#1e2130", // Card background
        accent: "#627eea", // Blue accent
        success: "#10b981", // Green for positive changes
        danger: "#ef4444", // Red for negative changes
      },
    },
  },
  plugins: [],
};
