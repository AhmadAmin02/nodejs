const express = require('express');
const puppeteer = require("puppeteer-core");
const path = require('path');
const router = express.Router();

// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get("/test", async (req, res) => {
  //const browser = await puppeteer.launch()
  res.json({
    result: "hanya test"
  });
});

module.exports = router;
