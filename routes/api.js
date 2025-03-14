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