const mysql = require("mysql2/promise");
const connection = mysql.createConnection("mysql://api_possiblyor:4c8ea527302142d3d5371935e523dec6f3013dee@be3zu.h.filess.io:61002/api_possiblyor");

connection.connect();

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS apikey (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apikey VARCHAR(255) NOT NULL UNIQUE,
        author VARCHAR(100) NOT NULL,
        expired DATETIME DEFAULT NULL,
        rank ENUM('basic', 'premium', 'vip', 'unlimited') NOT NULL DEFAULT 'free',
        \`limit\` INT DEFAULT NULL
    )
`;

connection.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Gagal membuat tabel:', err.message);
        return;
    }
    console.log('Tabel users siap digunakan.');
});

module.exports = connection;