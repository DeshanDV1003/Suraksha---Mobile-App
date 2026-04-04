// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#008DD5", // Header Blue
        secondary: "#10b981", // Emerald
        danger: "#ef4444",
        warning: "#f59e0b",
        info: "#3b82f6",
        suraksha: {
          blue: "#2563EB",
          red: "#F43F5E",
          green: "#10B981",
          orange: "#F97316",
          yellow: "#EAB308",
          bg: "#F8FAFC",
        },
        alert: {
          red: { bg: "#FFF5F5", border: "#EF4444" },
          orange: { bg: "#FFF9F2", border: "#F97316" },
          yellow: { bg: "#FEFCE8", border: "#EAB308" },
        },
        status: {
          pending: { bg: "#FEF3C7", text: "#D97706" },
          assigned: { bg: "#DBEAFE", text: "#2563EB" },
          completed: { bg: "#D1FAE5", text: "#059669" },
          volunteer: { bg: "#D1FAE5", text: "#059669" },
        }
      },
    },
  },
  plugins: [],
};
