const fs = require("fs");
const path = require("path");
const m = require("../config");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../db", "apikey.json")));

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
    if (!isApiKey(apikey)) {
        return res.status(m.notKey(apikey).status).json(m.notKey(apikey));
    }
    next();
}

function resp(res, param) {
    return res.status(m.reqParam(param).status).json(m.reqParam(param));
}

function isEmpty(str) {
    return typeof str === "string" && str.trim().length === 0;
}

module.exports = { isApiKey, ca, resp, isEmpty };