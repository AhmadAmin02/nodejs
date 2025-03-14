const express = require("express");
const router = express.Router();

const fs = require("fs");
const { isApiKey, ca, resp, isEmpty } = require("../lib/function");
const m = require("../config");

const ai = require("../scrape/ai");
const islamic = require("../scrape/islamic");
const stalk = require("../scrape/stalk");
const download = require("../scrape/download");

//  ISLAMIC

router.get("/islamic/jadwalsholat", ca, async (req, res) => {
    try {
        const wilayah = req.query.wilayah || req.query.kota;
        if (!wilayah && isEmpty(wilayah)) return resp(res, "wilayah");
        const result = await islamic.JadwalSholat.byCity(wilayah);
        res.json(m.res(result));
    } catch (e) {
        console.error(e);
        res.status(500).json(m.err);
    }
});

/*router.get("/islamic/surah", ca, async (req, res) => {
    const result = await islamic.getAllSurah();
    res.status(200).json({
        status: 200,
        author,
        result
    });
});

//  AI

router.get("/ai/muslim", ca, async (req, res) => {
    const teks = req.query.teks;
    if (!teks) return res.status(404).json(notParam(["teks"]));
    const result = await ai.muslimAI(teks);
    if (result) {
        res.status(200).json({
            status: 200,
            result: result
        });
    } else {
        res.status(500).json({
            status: 500,
            result: "Error!"
        });
    }
});

router.get("/ai/ahmdai", ca, async (req, res) => {
    const text = req.query.text;
    const model = req.query.model;
    const id = req.query.id;
    if (!text || !model || !id) return res.status(404).json(notParam(["text", "model", "id"]));
    const result = await ai.getMessage(text, model, id);
    if (result) {
        res.status(200).json({
            status: 200,
            author,
            isNewSession: result.isNew,
            result: result.message
        });
    }
});

//  STALK

router.get("/stalk/tiktok", ca, async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(404).json(notParam(["username"]));
    const result = await stalk.tiktokStalk(username);
    if (result) {
        res.status(200).json({
            status: 200,
            author: author,
            result: result
        });
    } else {
        res.status(500).json({
            status: 500,
            author: author,
            result: "Error!, Username not found!"
        });
    }
});

router.get("/stalk/freefire", ca, async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(404).json(notParam(["id"]));
    const result = await stalk.ffStalk(id);
    if (!result) {
        res.status(500).json({
            status: 500,
            author,
            result: "Error!, Id tida ditemukan!"
        });
    } else {
    res.status(200).json({
        status: 200,
        author,
        result
    });
    }
});

router.get("/stalk/github", ca, async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(404).json(notParam(["username"]));
    const result = await stalk.githubStalk(username);
    res.status(200).json({
        status: 200,
        author,
        result
    });
});

router.get("/stalk/instagram", ca, async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(404).json(notParam(["username"]));
    const result = await stalk.igStalk(username);
    res.status(200).json({
        status: 200,
        author,
        result
    });
});

//  DOWNLOADER

router.get("/download/ytmp4", ca, async (req, res) => {
    const link = req.query.link;
    if (!link) return res.status(404).json(notParam(["link"]));
    const result = await download.ytdown("mp4", link);
    res.status(200).json({
        status: 200,
        author,
        result
    });
});

router.get("/download/videy", ca, async (req, res) => {
    const link = req.query.link;
    if (!link) return res.status(404).json(notParam(["link"]));
    const result = download.videyDown(link);
    res.status(200).json({
        status: 200,
        author,
        result
    });
});

router.get("/download/mediafire", ca, async (req, res) => {
    const link = req.query.link;
    if (!link) return res.status(404).json(notParam(["link"]));
    const result = await download.mediaFireDown(link);
    res.json({
        status: 200,
        author,
        result
    });
});

router.get("/download/tiktok", ca, async (req, res) => {
    const link = req.query.link;
    if (!link) return res.status(404).json(notParam(["link"]));
    const result = await download.tiktokDown(link);
    res.json({
        status: 200,
        author,
        result
    });
});*/

module.exports = router;