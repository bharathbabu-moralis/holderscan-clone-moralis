// routes.js
const express = require("express");
const controllers = require("./controllers");
const router = express.Router();

// Search routes
router.get("/search", controllers.searchTokens);

// Holder statistics routes
router.get("/holders/:chain/:address", controllers.getTokenHolderStats);

// Historical holder data for charts
router.get(
  "/holders/:chain/:address/historical",
  controllers.getTokenHolderHistory
);

// Token metadata routes
router.get("/token/evm/metadata", controllers.getEVMTokenMetadata);
router.get(
  "/token/solana/:tokenAddress/metadata",
  controllers.getSolanaTokenMetadata
);

// Trending tokens route
router.get("/trending-tokens", controllers.getTrendingTokens);

router.get("/trends", controllers.getTrendingHolderChanges);

// routes.js - Add this route
router.get("/token/:chain/:address", controllers.getTokenDetails);

// Token owners route
router.get("/token/:chain/:address/owners", controllers.getTokenOwners);

module.exports = router;
