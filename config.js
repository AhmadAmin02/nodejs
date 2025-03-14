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

module.exports = m;