const express = require('express');
const puppeteer = require("puppeteer");
const path = require('path');
const router = express.Router();

// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get("/test", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ error: "gtw dh" });
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
  await page.goto(url);
  const result = await page.screenshot({ fullPage: true });
  await browser.close();
  res.set("Content-Type", "image/png");
  res.send(result);
});

module.exports = router;
