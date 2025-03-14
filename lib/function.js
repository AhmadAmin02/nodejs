const fs = require("fs");
const path = require("path");
const m = require("../config");
const { rateLimit } = require("express-rate-limit");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../db", "apikey.json")));

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 10,
    message: m.limit
});

/**
 * 
 * @param {string} keys 
 * @returns {boolean}
 * Mencari ApiKey
 */
function isApiKey(keys = "") {
    //const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../db", "apikey.json")));
    return data.some(el => el.apikey === keys);
}

function ca(req, res, next) {
    const apikey = req.query.apikey;
    if (!apikey) {
        return res.status(m.reqKey.status).json(m.reqKey);
    } else {
        if (!isApiKey(apikey)) {
            return res.status(m.notKey(apikey).status).json(m.notKey(apikey));
        }
    }
    limiter(req, res, next);
}

function resp(res, param) {
    return res.status(m.reqParam(param).status).json(m.reqParam(param));
}

function isEmpty(str) {
    return typeof str === "string" && str.trim().length === 0;
}

module.exports = { isApiKey, ca, resp, isEmpty };