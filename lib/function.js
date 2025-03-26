const fs = require("fs");
const path = require("path");
const { m, rank } = require("../config");
const { rateLimit } = require("express-rate-limit");
const keyPath = path.join(__dirname, "../db", "apikey.json");

let key = [];

loadApiKey();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 10,
    message: m.limitm
});

/**
 * 
 * @param {string} keys 
 * @returns {boolean}
 * Mencari ApiKey
 */
function isApiKey(keys = "") {
    //const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../db", "apikey.json")));
    return key.some(el => el.apikey === keys);
}

function addApiKey(keys = "", author = "", expired = "", ranks = "") {
    const data = key.some(x => x.apikey === keys);
    if (!data) {
        if (!expired.includes("/")) return false;
        const [date, month, year] = expired.split("/");
        const dates = new Date(Number(year), Number(month - 1), Number(date), 0, 0, 0).toISOString();
        const limit = rank.hasOwnProperty(ranks) ? rank[ranks] : rank["basic"];
        key.push({
            apikey: keys,
            author,
            expired: dates,
            rank: ranks,
            limit
        });
        saveApiKey();
        return true;
    } else {
        return false;
    }
}

function loadApiKey() {
    key = JSON.parse(fs.readFileSync(keyPath));
}

function keyExpired(keys = "") {
    const data = key.find(x => x.apikey === keys);
    if (data.expired === "-") return false;
    if (new Date(data.expired) < new Date()) {
        return true;
    }
    return false;
}

function removeApiKeyExpired() {
    const now = new Date();
    const before = key.length;
    key = key.filter(x => new Date(x.expired) > now);
    if (key.length !== before) {
        console.log("ApiKey Expired Cleaned!");
    }
}

function delLimit(keys = "") {
    const data = key.find(x => x.apikey === keys);
    if (data === undefined || !data) return false;
    if (typeof data.limit === "number") {
        if (data.limit <= 0) {
            return false;
        } else {
            data.limit -= 1;
            return true;
        }
    } else if (data.limit === false) {
        return true;
    }
}

function ca(req, res, next) {
    const apikey = req.query.apikey;
    if (!apikey) {
        return res.status(m.reqKey.status).json(m.reqKey);
    } else {
        if (!isApiKey(apikey)) {
            return res.status(m.notKey(apikey).status).json(m.notKey(apikey));
        } else {
            //const data = key.find(x => x.apikey === apikey);
            const del = delLimit(apikey);
            if (!del) {
                return res.status(m.limitk.status).json(m.limitk);
            }
        }
    }
    limiter(req, res, next);
}

function resp(res, param) {
    return res.status(m.reqParam(param).status).json(m.reqParam(param));
}

function saveApiKey() {
    fs.writeFileSync(keyPath, JSON.stringify(key, null, 2));
}

/*function clearExpired() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Set ke jam 12 malam
  
    const timeUntilMidnight = midnight - now;
  
    setTimeout(() => {
        removeApiKeyExpired();
        setInterval(removeApiKeyExpired, 24 * 60 * 60 * 1000); // Setiap 24 jam
    }, timeUntilMidnight);
}

clearExpired();*/

fs.watchFile(keyPath, () => {
    saveApiKey();
    console.log("ApiKey Berubah.");
    console.log(key);
    loadApiKey();
});

module.exports = { isApiKey, ca, resp, addApiKey, key };