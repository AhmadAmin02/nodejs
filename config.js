const author = "AhmDev";

const m = {
    reqKey: {
        status: 400,
        author,
        result: "Parameter ApiKey harus diisi!, Tidak punya ApiKey? chat aja owner dibagian dashboard."
    },
    err: {
        status: 500,
        author,
        result: "Mohon Maaf, Telah terjadi error pada server. silahkan laporkan error ke owner!"
    },
    limitm: {
        status: 429,
        author,
        result: "Terlalu banyak permintaan. kamu sudah mencapai 10 limit. silahkan coba lagi dalam 1 menit"
    },
    limitk: {
        status: 429,
        author,
        result: "Kamu telah mencapai limit. upgrade akun kamu untuk limit yang lebih banyak!"
    },
    notKey: (key) => ({
        status: 401,
        author,
        result: `Apikey ${key} tidak ditemukan!, Mau ApiKey? chat aja owner dibagian dashboard.`
    }),
    reqParam: (param) => ({
        status: 400,
        author,
        result: `Parameter ${param} harus diisi!`
    }),
    res: (result) => ({
        status: 200,
        author,
        result
    })
}

const rank = {
    basic: 100,
    premium: 1000,
    vip: 5000,
    unlimited: false
}

//  PASSWORD UNTUK MENAMBAHKAN APIKEY
const password = "AhmDev";

module.exports = { m, rank, password }