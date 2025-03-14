/**
 * myQuran API Functions
 * Implementasi fungsi untuk mengakses API https://api.myquran.com/v2
 */

const axios = require('axios');
const cheerio = require("cheerio");
const fs = require("fs");
const path = require('path');

// URL dasar API
const BASE_URL = 'https://api.myquran.com/v2';

/**
 * Fungsi untuk mendapatkan daftar semua surah dalam Al-Quran
 * @returns {Promise} Promise yang berisi data semua surah
 */
async function getAllSurah() {
  try {
    const response = await axios.get(`${BASE_URL}/surah`);
    return response.data;
  } catch (error) {
    throw new Error(`Gagal mengambil daftar surah: ${error.message}`);
  }
}

/**
 * Fungsi untuk mendapatkan detail surah berdasarkan nomor surah
 * @param {number} surahNumber - Nomor surah (1-114)
 * @returns {Promise} Promise yang berisi detail surah
 */
async function getSurahByNumber(surahNumber) {
  if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
    throw new Error('Nomor surah tidak valid. Harap masukkan nomor antara 1-114.');
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/surah/${surahNumber}`);
    return response.data;
  } catch (error) {
    throw new Error(`Gagal mengambil surah #${surahNumber}: ${error.message}`);
  }
}

/**
 * Fungsi untuk mendapatkan ayat tertentu dari surah
 * @param {number} surahNumber - Nomor surah (1-114)
 * @param {number} ayahNumber - Nomor ayat
 * @returns {Promise} Promise yang berisi data ayat
 */
async function getAyahBySurahAndNumber(surahNumber, ayahNumber) {
  if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
    throw new Error('Nomor surah tidak valid. Harap masukkan nomor antara 1-114.');
  }
  
  if (!ayahNumber || ayahNumber < 1) {
    throw new Error('Nomor ayat tidak valid.');
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/surah/${surahNumber}/${ayahNumber}`);
    return response.data;
  } catch (error) {
    throw new Error(`Gagal mengambil ayat #${ayahNumber} dari surah #${surahNumber}: ${error.message}`);
  }
}

/**
 * Fungsi untuk mendapatkan daftar juz dalam Al-Quran
 * @returns {Promise} Promise yang berisi data semua juz
 */
async function getAllJuz() {
  try {
    const response = await axios.get(`${BASE_URL}/juz`);
    return response.data;
  } catch (error) {
    throw new Error(`Gagal mengambil daftar juz: ${error.message}`);
  }
}

/**
 * Fungsi untuk mendapatkan detail juz berdasarkan nomor juz
 * @param {number} juzNumber - Nomor juz (1-30)
 * @returns {Promise} Promise yang berisi detail juz
 */
async function getJuzByNumber(juzNumber) {
  if (!juzNumber || juzNumber < 1 || juzNumber > 30) {
    throw new Error('Nomor juz tidak valid. Harap masukkan nomor antara 1-30.');
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/juz/${juzNumber}`);
    return response.data;
  } catch (error) {
    throw new Error(`Gagal mengambil juz #${juzNumber}: ${error.message}`);
  }
}

/**
 * Fungsi untuk mendapatkan daftar semua kota
 * @returns {Promise} Promise yang berisi data semua kota
 */
async function getAllCities() {
  try {
    const response = await axios.get(`${BASE_URL}/sholat/kota/semua`);
    return response.data;
  } catch (error) {
    throw new Error(`Gagal mengambil daftar kota: ${error.message}`);
  }
}

const list = JSON.parse(fs.readFileSync(path.join(__dirname, "../db", "kota.json")));
const JadwalSholat = {
  LIST: list,
  searchByName(query) {
    console.log("Jumlah:", list.length);
    const result = JadwalSholat.LIST.find(
      (item) => item.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (result) {
      return result;
    }
    
    return null;
  },
  byCity(q) {
    return this.byId(this.searchByName(q).value);
  },
  async byId(id) {
    const res = await fetch('https://jadwalsholat.org/jadwal-sholat/monthly.php?id=' + id);
    const data = await res.text();
    const $ = cheerio.load(data);
    const out = {
      title: $('tr.table_title h1').text().trim(),
      month: $('tr.table_title h2').text().trim(),
      city: $('option:selected').text().trim(),
      today: {},
      list: []
    };
    
    $('tr').each((i, e) => {
      if (!['table_highlight', 'table_dark', 'table_light'].includes($(e).attr('class'))) return;
      let obj = {
        tanggal: $(e).find('td:eq(0)').text(),
        imsyak: $(e).find('td:eq(1)').text(),
        shubuh: $(e).find('td:eq(2)').text(),
        terbit: $(e).find('td:eq(3)').text(),
        dhuha: $(e).find('td:eq(4)').text(),
        dzuhur: $(e).find('td:eq(5)').text(),
        ashr: $(e).find('td:eq(6)').text(),
        maghrib: $(e).find('td:eq(7)').text(),
        isya: $(e).find('td:eq(8)').text(),
      };
      if ($(e).attr('class') === 'table_highlight') out.today = obj;
      out.list.push(obj)
    })
    
    return out;
  }
};

/**
 * Fungsi untuk mencari surah berdasarkan kata kunci
 * @param {string} keyword - Kata kunci pencarian
 * @returns {Promise} Promise yang berisi hasil pencarian
 */
async function searchSurah(keyword) {
  if (!keyword || keyword.trim() === '') {
    throw new Error('Kata kunci pencarian tidak valid.');
  }
  
  try {
    // Dapatkan semua surah terlebih dahulu
    const allSurah = await getAllSurah();
    
    // Filter berdasarkan kata kunci
    const searchResults = allSurah.data.filter(surah => {
      const namaLatin = surah.namaLatin.toLowerCase();
      const arti = surah.arti.toLowerCase();
      const searchTerm = keyword.toLowerCase();
      
      return namaLatin.includes(searchTerm) || arti.includes(searchTerm);
    });
    
    return {
      status: true,
      message: 'Hasil pencarian surah',
      data: searchResults
    };
  } catch (error) {
    throw new Error(`Gagal mencari surah dengan kata kunci "${keyword}": ${error.message}`);
  }
}

// Contoh penggunaan
// async function main() {
//   try {
//     // Mendapatkan daftar semua surah
//     const allSurah = await getAllSurah();
//     console.log('Daftar Surah:', allSurah.data.length);
//     
//     // Mendapatkan detail surah Al-Fatihah
//     const surahAlFatihah = await getSurahByNumber(1);
//     console.log('Surah Al-Fatihah:', surahAlFatihah.data.nama);
//     
//     // Mendapatkan ayat pertama dari surah Al-Fatihah
//     const ayah = await getAyahBySurahAndNumber(1, 1);
//     console.log('Ayat 1 Al-Fatihah:', ayah.data.teksArab);
//     
//     // Mendapatkan jadwal sholat untuk Jakarta hari ini
//     const jakartaId = '1301'; // ID kota Jakarta
//     const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
//     const prayerTimes = await getPrayerTimesByCityAndDate(jakartaId, today);
//     console.log('Jadwal Sholat Jakarta:', prayerTimes.data.jadwal);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }
// 
// main();

module.exports = {
  getAllSurah,
  getSurahByNumber,
  getAyahBySurahAndNumber,
  getAllJuz,
  getJuzByNumber,
  getAllCities,
  JadwalSholat,
  searchSurah
};
