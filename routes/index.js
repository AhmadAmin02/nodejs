const express = require('express');
const puppeteer = require("puppeteer");
const path = require('path');
const router = express.Router();

// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get("/test", async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });
  const page = await browser.newPage();
  await page.goto("https://ahmdev.web.id");
  const result = await page.title();
  await browser.close();
  res.json({
    result
  });
});

module.exports = router;
