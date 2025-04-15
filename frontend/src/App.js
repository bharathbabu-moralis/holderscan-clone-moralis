import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import HolderTrends from "./components/HolderTrends";
import TokenPage from "./components/TokenPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-primary text-white">
        <header className="py-4 px-6 flex justify-between items-center border-b border-gray-800">
          <Link to="/" className="flex flex-col">
            <h1 className="text-xl font-bold">HolderAnalytics</h1>
            <span className="text-xs text-blue-400 mt-0.5">
              Powered by Moralis
            </span>
          </Link>
        </header>

        <main className="container mx-auto p-6">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Dashboard />
                  <div className="mt-8">
                    <HolderTrends />
                  </div>
                </>
              }
            />
            <Route path="/token/:chain/:address" element={<TokenPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
