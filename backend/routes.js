const express = require("express");
const controllers = require("./controllers");
const router = express.Router();

// Search route
router.get("/search", controllers.searchTokens);

// Holder statistics route
router.get("/holders/:chain/:address", controllers.getTokenHolderStats);

// Historical holder data for charts
router.get(
  "/holders/:chain/:address/historical",
  controllers.getTokenHolderHistory
);

// EVM token metadata routes
router.get("/token/evm/metadata", controllers.getEVMTokenMetadata);

// Solana token metadata route
router.get(
  "/token/solana/:tokenAddress/metadata",
  controllers.getSolanaTokenMetadata
);

// Trending tokens route
router.get("/trending-tokens", controllers.getTrendingTokens);

// Trending holder changes route
router.get("/trends", controllers.getTrendingHolderChanges);

// Token owners route
router.get("/token/:chain/:address/owners", controllers.getTokenOwners);

module.exports = router;
