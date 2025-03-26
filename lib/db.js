const mysql = require("mysql2/promise");

// URI MySQL kamu
const uri = "mysql://api_possiblyor:4c8ea527302142d3d5371935e523dec6f3013dee@be3zu.h.filess.io:61002/api_possiblyor";

// Convert URI ke object
const config = (() => {
    const parsed = new URL(uri);
    return {
        host: parsed.hostname,
        user: parsed.username,
        password: parsed.password,
        database: parsed.pathname.replace("/", ""),
        port: Number(parsed.port),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
})();

// Buat koneksi pool
const db = mysql.createPool(config);

// Buat tabel jika belum ada
(async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS apikey (
            id INT AUTO_INCREMENT PRIMARY KEY,
            apikey VARCHAR(255) NOT NULL UNIQUE,
            author VARCHAR(100) NOT NULL,
            expired DATETIME DEFAULT NULL,
            rank ENUM('free', 'basic', 'premium', 'vip', 'unlimited') NOT NULL DEFAULT 'free',
            \`limit\` INT DEFAULT NULL
        )
    `;
    
    try {
        const connection = await db.getConnection();
        await connection.query(createTableQuery);
        connection.release();
        console.log("✅ Tabel 'apikey' siap digunakan.");
    } catch (err) {
        console.error("❌ Gagal membuat tabel:", err.message);
    }
})();

module.exports = db;