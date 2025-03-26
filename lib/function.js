const db = require("./db");
const { m, rank } = require("../config");
const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 10,
    message: m.limitm
});

/**
 * Mengecek apakah API key valid.
 * @param {string} keys 
 * @returns {Promise<boolean>}
 */
async function isApiKey(keys = "") {
    try {
        const [rows] = await db.execute("SELECT COUNT(*) AS count FROM apikey WHERE apikey = ?", [keys]);
        return rows[0].count > 0;
    } catch (err) {
        console.error("Gagal mengecek API key:", err);
        return false;
    }
}

/**
 * Menambahkan API key ke database.
 * @param {string} keys
 * @param {string} author
 * @param {string} expired (format: DD/MM/YYYY)
 * @param {string} ranks
 * @returns {Promise<boolean>}
 */
async function addApiKey(keys = "", author = "", expired = "", ranks = "free") {
    if (!expired.includes("/")) return false;
    if (!Object.keys(rank).includes(ranks)) return false; // Cek apakah rank valid

    const [date, month, year] = expired.split("/");
    const dates = new Date(Number(year), Number(month - 1), Number(date), 0, 0, 0);

    try {
        await db.execute(
            "INSERT INTO apikey (apikey, author, expired, `rank`, `limit`) VALUES (?, ?, ?, ?, ?)",
            [keys, author, dates, ranks, rank[ranks]]
        );
        return true;
    } catch (err) {
        console.error("Gagal menambahkan API key:", err);
        return false;
    }
}

/**
 * Mengecek apakah API key sudah expired.
 * @param {string} keys
 * @returns {Promise<boolean>}
 */
async function keyExpired(keys = "") {
    try {
        const [rows] = await db.execute("SELECT expired FROM apikey WHERE apikey = ?", [keys]);
        if (rows.length === 0) return false;
        if (!rows[0].expired) return false; // Jika expired null, berarti unlimited

        return new Date(rows[0].expired) < new Date();
    } catch (err) {
        console.error("Gagal mengecek API key expired:", err);
        return false;
    }
}

/**
 * Menghapus API key yang sudah expired.
 */
async function removeApiKeyExpired() {
    try {
        const now = new Date();
        const [result] = await db.execute("DELETE FROM apikey WHERE expired IS NOT NULL AND expired < ?", [now]);
        if (result.affectedRows > 0) {
            console.log("ApiKey Expired Cleaned!");
        }
    } catch (err) {
        console.error("Gagal menghapus API key expired:", err);
    }
}

/**
 * Mengurangi limit API key jika masih tersedia.
 * @param {string} keys
 * @returns {Promise<boolean>}
 */
async function delLimit(keys = "") {
    try {
        const [rows] = await db.execute("SELECT `limit` FROM apikey WHERE apikey = ?", [keys]);
        if (rows.length === 0) return false;

        const currentLimit = rows[0].limit;
        if (currentLimit === null || currentLimit === false) return true; // Unlimited

        if (currentLimit <= 0) return false;

        await db.execute("UPDATE apikey SET `limit` = `limit` - 1 WHERE apikey = ?", [keys]);
        return true;
    } catch (err) {
        console.error("Gagal mengurangi limit API key:", err);
        return false;
    }
}

/**
 * Middleware untuk mengecek API key.
 */
async function ca(req, res, next) {
    const apikey = req.query.apikey;
    if (!apikey) {
        return res.status(m.reqKey.status).json(m.reqKey);
    }

    if (!(await isApiKey(apikey))) {
        return res.status(m.notKey(apikey).status).json(m.notKey(apikey));
    }

    if (await keyExpired(apikey)) {
        return res.status(m.limitk.status).json(m.limitk);
    }

    if (!(await delLimit(apikey))) {
        return res.status(m.limitk.status).json(m.limitk);
    }

    limiter(req, res, next);
}

/**
 * Helper untuk mengembalikan response.
 */
function resp(res, param) {
    return res.status(m.reqParam(param).status).json(m.reqParam(param));
}

module.exports = { isApiKey, ca, resp, addApiKey, keyExpired, removeApiKeyExpired };