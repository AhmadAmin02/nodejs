const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const https = require("node:https");
const fake = require("fake-useragent");
const crypto = require("node:crypto");

//  TIKTOK

async function tiktokStalk(username = "ahmdev") {
  try {
    const response = await axios.get(`https://www.tiktok.com/@${username}?_t=ZS-8tHANz7ieoS&_r=1`);
    const html = response.data;
    const $ = cheerio.load(html);
    const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();

    if (!scriptData) {
      throw new Error('User tidak ditemukan atau TikTok mengubah struktur halaman.');
    }

    const parsedData = JSON.parse(scriptData);
    const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail'];
    if (!userDetail) {
      throw new Error('User tidak ditemukan');
    }

    const userInfo = userDetail.userInfo?.user;
    const stats = userDetail.userInfo?.stats;

    return {
      username: userInfo?.uniqueId || null,
      nama: userInfo?.nickname || null,
      bio: userInfo?.signature || null,
      verifikasi: userInfo?.verified || false,
      totalfollowers: stats?.followerCount || 0,
      totaldisukai: stats?.heart || 0,
      totalvideo: stats?.videoCount || 0,
      avatar: userInfo?.avatarLarger || null,
    };
  } catch (error) {
    return { error: error.message };
  }
}

//  GITHUB

async function githubStalk(username = "ahmdev") {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: { "User-Agent": "GitHub-Stalker" },
    });

    const data = response.data;

    return {
      name: data.name || "Tidak tersedia",
      username: data.login,
      profile_url: data.html_url,
      location: data.location || "Tidak tersedia",
      company: data.company || "Tidak tersedia",
      bio: data.bio || "Tidak tersedia",
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
      public_repos: data.public_repos,
      public_gists: data.public_gists,
      avatar_url: data.avatar_url,
    };
  } catch (error) {
    return { error: "Gagal mengambil data. Periksa username atau koneksi internet." };
  }
}

//  FREE FIRE

/**
 * Get Account info
 * @param {string} id 
 * @returns {Promise <Object>}
 */
async function ffStalk(id = "") {
  let formdata = new FormData()
  formdata.append('uid', id)
  let { data } = await axios.post('https://tools.freefireinfo.in/profileinfo.php?success=1', formdata, {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "origin": "https://tools.freefireinfo.in",
      "referer": "https://tools.freefireinfo.in/profileinfo.php?success=1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      "cookie": "_ga=GA1.1.1069461514.1740728304; __gads=ID=fa4de8c6be61d818:T=1740728303:RT=1740728303:S=ALNI_MYhU5TQnoVCO8ZG1O95QdJQc1-u1Q; __gpi=UID=0000104decca5eb5:T=1740728303:RT=1740728303:S=ALNI_MaVhADwQqMyGY78ZADfPLLbbw8zfQ; __eoi=ID=f87957be98f6348b:T=1740728303:RT=1740728303:S=AA-Afjb5ISbOLmlxgjjGBUWT3RO3; PHPSESSID=d9vet6ol1uj3frjs359to1i56v; _ga_JLWHS31Q03=GS1.1.1740728303.1.1.1740728474.0.0.0; _ga_71MLQQ24RE=GS1.1.1740728303.1.1.1740728474.57.0.1524185982; FCNEC=%5B%5B%22AKsRol9jtdxZ87hML5ighFLFnz7cP30Fki_Fu8JOnfi-SOz3P6QL33-sNGahy6Hq5X9moA6OdNMIcgFtvZZJnrPzHecI_XbfIDiQo9Nq-I1Y_PRXKDUufD0nNWLvDRQBJcdvu_bOqn2X06Njaz3k4Ml-NvsRVw21ew%3D%3D%22%5D%5D"
    }
  });
  const $ = cheerio.load(data)
  let tr = $('div.result').html().split('<br>')
  let name = tr[0].split('Name: ')[1]
  let bio = tr[14].split(': ')[1]
  let like = tr[2].split(': ')[1]
  let level = tr[3].split(': ')[1]
  let exp = tr[4].split(': ')[1]
  let region = tr[5].split(': ')[1]
  let honorScore = tr[6].split(': ')[1]
  let brRank = tr[7].split(': ')[1]
  let brRankPoint = tr[8].split(': ')[1]
  let csRankPoint = tr[9].split(': ')[1]
  let accountCreated = tr[10].split(': ')[1]
  let lastLogin = tr[11].split(': ')[1]
  let preferMode = tr[12].split(': ')[1]
  let language = tr[13].split(': ')[1]
  let booyahPassPremium = tr[16].split(': ')[1]
  let booyahPassLevel = tr[17].split(': ')[1]
  let petName = tr[20].split(': ')[1] || 'doesnt have pet.'
  let petLevel = tr[21].split(': ')[1] || 'doesnt have pet.'
  let petExp = tr[22].split(': ')[1] || 'doesnt have pet.'
  let starMarked = tr[23].split(': ')[1] || 'doesnt have pet.'
  let selected = tr[24].split(': ')[1] || 'doesnt have pet.'
  // Extract guild info - need to check if it exists in the result
  let guild = 'Tidak memiliki guild'
  let guildLevel = "Tidak memiliki guild"
  let guildMember = "Tidak memiliki guild"
  let guildId = "Tidak memiliki guild"
  if (tr.length > 26 && tr[26]) {
    if (tr[26].includes('Guild Information')) {
      guild = tr[27].split(": ")[1]
      guildLevel = tr[28].split(": ")[1];
      guildMember = tr[29].split(": ")[1];
      guildId = tr[30].split(": ")[1];
    }
  }
  let equippedItems = []
  $('.equipped-items').find('.equipped-item').each((i, e) => {
    let name = $(e).find('p').text().trim()
    let img = $(e).find('img').attr('src')
    equippedItems.push({
      name,
      img
    });
  });
  return {
    name,
    bio,
    like,
    level,
    exp,
    region,
    honorScore,
    brRank,
    brRankPoint,
    csRankPoint,
    accountCreated,
    lastLogin,
    preferMode,
    language,
    booyahPassPremium,
    booyahPassLevel,
    pet: {
      name: petName,
      level: petLevel,
      exp: petExp,
      starMarked,
      selected
    },
    guild: {
      id: guildId,
      name: guild,
      level: guildLevel,
      member: guildMember
    },
    equippedItems
  }
}

//  INSTAGRAM

/**
 *  * Extract essential Instagram user information from API response
  * @param {Object} response - The raw API response
   * @return {Object} Essential user information
    */
function simpleIG(response) {
  // Check if the response is valid
  if (!response) {
    return null;
  }

  const user = response?.result[0]?.user;
  if (user === undefined) return response;

  // Extract the most important information
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    biography: user.biography,
    isVerified: user.is_verified,
    isPrivate: user.is_private,
    followerCount: user.follower_count,
    followingCount: user.following_count,
    mediaCount: user.media_count,
    profilePicUrl: user.profile_pic_url,
    hdProfilePicUrl: user.hd_profile_pic_url_info?.url || null,
    externalUrl: user.external_url,
    bioLinks: user.bio_links?.map(link => ({
      title: link.title,
      url: link.url
    })) || [],
    publicEmail: user.public_email,
    category: user.category,
    isBusiness: user.is_business
  };
}


const MSEC = "https://igram.world/msec";
const USER_INFO = "https://api-wh.igram.world/api/v1/instagram/userInfo";

const SECRECT_KEY = "3526501d956b1c95459de077386711c0529330544d2d57ad6781cc33fa03c7a3";
const FIXED_TIMESTAMP = 1740129810449;

const agent = https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
})

let headersList = {
  "authority": "igram.world",
  "accept": "*/*",
  "accept-encoding": "gzip, deflate, br, zstd",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
  "cache-control": "no-cache",
  "pragma": "no-cache",
  "priority": "u=1, i",
  "referer": "https://igram.world/",
  "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent": fake()
  // "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
}

function _delay(msec) {
  return new Promise(resolve => setTimeout(resolve, msec));
}

async function _req({ url, method = "GET", data = null, params = null, head = null, response = "json" }) {
  try {
    var headers = {};
    var param;
    var datas;

    if (head && head == "original" || head == "ori") {
      const uri = new URL(url);
      headers = {
        authority: uri.hostname,
        origin: "https://" + uri.hostname,
        'Cache-Control': 'no-cache',
        "user-agent": fake()
      }
    } else if (head && typeof head == "object") {
      headers = head;
    }
    if (params && typeof params == "object") {
      param = params;
    } else {
      param = "";
    }
    if (data) {
      datas = data
    } else {
      datas = "";
    }

    const options = {
      url: url,
      method: method,
      headers,
      timeout: 30_000,
      responseType: response,
      httpsAgent: agent,
      validateStatus: (status) => {
        return status <= 500;
      },
      ...(!datas ? {} : { data: datas }),
      ...(!params ? {} : { params: param })
    }
    const res = await axios.request(options);

    return res;
  } catch (error) {
    console.log(error)
  }
}

function _sort(p116) {
  return Object.keys(p116).sort().reduce(function (p117, p118) {
    p117[p118] = p116[p118];
    return p117;
  }, {});
}

async function _getSignature(payload) {
  const rs = await _req({
    url: MSEC,
    head: headersList
  })
  const { msec } = rs.data

  let v93 = 0;
  v93 = Math.floor(msec * 1000);

  let v97 = v93 ? Date.now() - v93 : 0;
  if (Math.abs(v97) < 60000) {
    v97 = 0;
  }

  const v98 = Date.now() - v97;

  const dig = `${typeof payload == "string" ? payload : JSON.stringify(_sort(payload))}${v98}${SECRECT_KEY}`;
  let v90 = new TextEncoder().encode(dig);
  const v91 = await crypto.subtle.digest("SHA-256", v90);
  const v92 = Array.from(new Uint8Array(v91));
  const s = v92.map(function (p115) {
    return p115.toString(16).padStart(2, "0");
  }).join("")

  return {
    ts: v98,
    _ts: FIXED_TIMESTAMP,
    _tsc: v97,
    _s: s
  }
}

function _getUsername(link) {
  let username = /https\:\/\/|http\:\/\//i.test(link) ? new URL(link) : link;
  if (username instanceof URL) {
    username = username.pathname.replace(/\//gi, "");
  }

  return username;
}

async function igStalk(user = "ahmdev") {
  const username = _getUsername(user);
  const payload = {
    username
  }

  const sign = await _getSignature(payload);
  const res = await _req({
    url: USER_INFO,
    method: "POST",
    data: {
      username,
      ...sign
    },
    head: headersList
  });
  return res.data;
}

module.exports = { tiktokStalk, githubStalk, ffStalk, igStalk };
