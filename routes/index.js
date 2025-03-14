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
  await page.evaluate((dates) => {
    var el = document.querySelector("input#date");
    el.value = dates;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, date);
  await page.evaluate((names) => {
    var el = document.querySelector("input#name");
    el.value = names;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, name);
  await page.evaluate((texts) => {
    var el = document.querySelector("textarea#content");
    el.value = texts;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, teks);
  const data = await page.evaluate(() => {
    const canva = document.querySelector("canvas#defaultCanvas0");
    return canva ? canva.toDataURL("image/png") : null;
  });
  const base64 = data.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  await browser.close();
  //const stream = new PassThrough();
  //stream.end(buffer);
  //res.set("Content-Type", "image/png");
  //stream.pipe(res);
  //res.send(buffer);
  res.json({
    result: base64
  });
});

module.exports = router;
