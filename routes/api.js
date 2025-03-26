const express = require("express");
const router = express.Router();

const db = require("../lib/db");
const { ca, resp, addApiKey } = require("../lib/function");
const { m, rank, password } = require("../config");

const ai = require("../scrape/ai");
const islamic = require("../scrape/islamic");
const stalk = require("../scrape/stalk");
const download = require("../scrape/download");

//  APIKEY

/**
 * Endpoint untuk mengecek detail API key
 */
router.get("/apikey/cek", ca, async (req, res) => {
    const keys = req.query.apikey;

    try {
        const [rows] = await db.execute("SELECT * FROM apikey WHERE apikey = ?", [keys]);
        if (rows.length === 0) return res.status(m.notKey(keys).status).json(m.notKey(keys));

        const data = rows[0];
        const exp = data.limit === false ? "Lifetime" : new Date(data.expired).toLocaleDateString("id-ID");

        const result = {
            apikey: keys,
            pemilik: data.author,
            rank: data.rank,
            limit: data.limit === false ? "∞" : data.limit,
            expiredAt: exp
        };

        res.json(m.res(result));
    } catch (err) {
        console.error("Gagal mengambil data API key:", err);
        res.status(m.err.status).json(m.err);
    }
});

/**
 * Endpoint untuk menampilkan semua API key (hanya owner)
 */
router.get("/apikey/list", async (req, res) => {
    const passwords = req.query.password;
    if (passwords !== password) return res.status(400).json({ error: "Password salah!" });

    try {
        const [rows] = await db.execute("SELECT apikey, author, rank, expired, `limit` FROM apikey");
        const result = rows.map(data => ({
            apikey: data.apikey,
            pemilik: data.author,
            rank: data.rank,
            limit: data.limit === false ? "∞" : data.limit,
            expiredAt: data.limit === false ? "Lifetime" : new Date(data.expired).toLocaleDateString("id-ID")
        }));

        res.json(m.res(result));
    } catch (err) {
        console.error("Gagal mengambil list API key:", err);
        res.status(m.err.status).json(m.err);
    }
});

/**
 * Endpoint untuk menambahkan API key baru (hanya owner)
 */
router.get("/apikey/add", async (req, res) => {
    const { passwords, apikey, author, expired, ranks } = req.query;
    
    if (passwords !== password) return res.status(400).json({ error: "Password salah! Bukan owner AhmDev ngapain kesini?" });
    if (!apikey || !author || !expired || !ranks) return res.status(400).json({ error: "Parameter Apikey, Author, Expired, Ranks Harus diisi!" });
    if (!rank.hasOwnProperty(ranks)) return res.status(400).json({ error: `Rank ${ranks} tidak ditemukan!, available ${Object.keys(rank).join(", ")}` });

    const success = await addApiKey(apikey, author, expired, ranks);
    if (!success) return res.status(403).json({ error: "ApiKey sudah ada, atau format parameter expired salah! Format: DD/MM/YYYY" });

    res.json(m.res(`Berhasil menambahkan ApiKey ${apikey} dengan pemilik ${author} dan rank ${ranks} akan expired pada ${expired}.`));
});

//  ISLAMIC

router.get("/islamic/jadwalsholat", ca, async (req, res) => {
    try {
        const wilayah = req.query.wilayah || req.query.kota;
        if (!wilayah) return resp(res, "wilayah");
        const result = await islamic.JadwalSholat.byCity(wilayah);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

router.get("/islamic/surah", ca, async (req, res) => {
    try {
        const result = await islamic.getAllSurah();
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

// AI

router.get("/ai/muslim", ca, async (req, res) => {
    try {
        const teks = req.query.teks;
        if (!teks) return resp(res, "teks");
        const result = await ai.muslimAI(teks);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

router.get("/ai/ahmdai", ca, async (req, res) => {
    try {
        const text = req.query.text;
        const model = req.query.model;
        const id = req.query.id;
        if (!text) return resp(res, "text");
        if (!model) return resp(res, "model");
        if (!id) return resp(res, "id");
        const result = await ai.getMessage(text, model, id);
        res.json(m.res({
            isNewSession: result.isNew,
            message: result.message
        }));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

// STALK

router.get("/stalk/tiktok", ca, async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) return resp(res, "username");
        const result = await stalk.tiktokStalk(username);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

router.get("/stalk/freefire", ca, async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return resp(res, "id");
        const result = await stalk.ffStalk(id);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

router.get("/stalk/github", ca, async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) return resp(res, "username");
        const result = await stalk.githubStalk(username);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

router.get("/stalk/instagram", ca, async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) return resp(res, "username");
        const result = await stalk.igStalk(username);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

// DOWNLOADER

router.get("/download/ytmp4", ca, async (req, res) => {
    try {
        const link = req.query.link;
        if (!link) return resp(res, "link");
        const result = await download.ytdown("mp4", link);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

router.get("/download/videy", ca, async (req, res) => {
    try {
        const link = req.query.link;
        if (!link) return resp(res, "link");
        const result = await download.videyDown(link);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

router.get("/download/mediafire", ca, async (req, res) => {
    try {
        const link = req.query.link;
        if (!link) return resp(res, "link");
        const result = await download.mediaFireDown(link);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

router.get("/download/tiktok", ca, async (req, res) => {
    try {
        const link = req.query.link;
        if (!link) return resp(res, "link");
        const result = await download.tiktokDown(link);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

module.exports = router;