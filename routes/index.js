const express = require('express');
const puppeteer = require("puppeteer");
const { PassThrough } = require("stream");
const path = require('path');
const router = express.Router();

// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get("/nulis", async (req, res) => {
  const { date, name, teks } = req.query;
  if (!date || !name || !teks) return res.json({ error: "gtw dh" });
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
  await page.goto("https://tulisno.vercel.app/", { waitUntil: "load", timeout: 0 });
  //const result = await page.screenshot({ fullPage: true, type: "jpeg" });
  await page.$eval("input#date", (el) => {
    el.value = date;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.$eval("input#name", (el) => {
    el.value = name;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.$eval("input#content", (el) => {
    el.value = teks;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const data = await page.evaluate(() => {
    const canva = document.querySelector("canvas#defaultCanvas0");
    return canva ? canva.toDataUrl("image/png") : null;
  });
  const base64 = data.replace(/^data:image\/png;base,/, "");
  const buffer = Buffer.from(base64, "base64");
  await browser.close();
  const stream = new PassThrough();
  stream.end(buffer);
  res.setHeader("Content-Type", "image/png");
  stream.pipe(res);
});

module.exports = router;
