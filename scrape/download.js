const axios = require("axios");
const https = require("node:https");
const fake = require("fake-useragent");
const crypto = require("node:crypto");

//  YOUTUBE

async function ytdown(type = "mp3" || "mp4", url = "") {
  const headers = {
    "accept": "*/*",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "Referer": "https://id.ytmp3.mobi/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
  const initial = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
  let format = type;
  const init = await initial.json();
  const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
  let convertURL = init.convertURL + `&v=${id}&f=${format}&_=${Math.random()}`;
  const converts = await fetch(convertURL, { headers });
  const convert = await converts.json();
  let info = {};
  for (let i = 0; i < 3; i++) {
    let j = await fetch(convert.progressURL, { headers });
    info = await j.json();
    console.log(info);
    if (info.progress == 3) break;
  }
  const result = {
    url: convert.downloadURL,
    title: info.title
  }
  return result;
}

//  INSTAGRAM

const MSEC = "https://igram.world/msec";
const URL_CONVERT = "https://api.igram.world/api/convert"

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
  return Object.keys(p116).sort().reduce(function(p117, p118) {
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
  const s = v92.map(function(p115) {
    return p115.toString(16).padStart(2, "0");
  }).join("")
  
  return {
    ts: v98,
    _ts: FIXED_TIMESTAMP,
    _tsc: v97,
    _s: s
  }
}

async function igdown(url) {
  const payload = url
  
  const sign = await _getSignature(payload);
  const pay = {
    url,
    ...sign
  }
  const res = await _req({
    url: URL_CONVERT,
    method: "POST",
    data: pay,
    head: headersList
  });
  return res.data;
}

//  MEDIA FIRE

async function mediaFireDown(url = "") {
  try {
    const response = await fetch('https://r.jina.ai/' + url);
    const text = await response.text();
    
    const result = {
      title: (text.match(/Title: (.+)/) || [])[1]?.trim() || '',
      link: (text.match(/URL Source: (.+)/) || [])[1]?.trim() || '',
      filename: '',
      url: '',
      size: '',
      repair: ''
    };
    
    if (result.link) {
      const fileMatch = result.link.match(/\/([^\/]+\.zip)/);
      if (fileMatch) result.filename = fileMatch[1];
    }
    
    const matches = [...text.matchAll(/\[(.*?)\]\((https:\/\/[^\s]+)\)/g)];
    for (const match of matches) {
      const desc = match[1].trim();
      const link = match[2].trim();
      
      if (desc.toLowerCase().includes('download') && desc.match(/\((\d+(\.\d+)?[KMGT]B)\)/)) {
        result.url = link;
        result.size = (desc.match(/\((\d+(\.\d+)?[KMG]?B)\)/) || [])[1] || '';
      }
      if (desc.toLowerCase().includes('repair')) {
        result.repair = link;
      }
    }
    
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

async function tiktokDown(link) {
  try {
    // Make the initial request to search for the TikTok video
    const response = await fetch('https://lovetik.com/api/ajax/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `query=${encodeURIComponent(link)}`
    });
    
    const data = await response.json();
    
    // Initialize images array if not present
    if (!data.images) data.images = [];
    
    // Prepare the result object
    const result = {
      video: [],
      audio: []
    };
    
    // Process links and categorize them as video or audio
    data.links.forEach(item => {
      if (!item.a) return;
      
      const formatted = {
        format: item.t.replace(/<.*?>|♪/g, '').trim(), // Remove HTML tags and ♪ symbol
        resolution: item.s || 'Audio Only',
        link: item.a
      };
      
      if (item.ft == 1) {
        result.video.push(formatted);
      } else {
        result.audio.push(formatted);
      }
    });
    
    // Add the render method to the result
    result.render = async () => {
      const slideItem = data.links.filter(m => m.c)[0];
      if (!slideItem || !slideItem.c) {
        return null;
      }
      
      const rendered = await fetch('https://lovetik.com/api/ajax/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `c_data=${encodeURIComponent(slideItem.c)}`
      });
      
      return rendered.json();
    };
    
    // Return the combined result
    return {
      ...data,
      ...result
    };
  } catch (error) {
    console.error('Error downloading TikTok:', error);
    throw error;
  }
}

//  VIDEY

function videyDown(link = "") {
  const url = new URL(link);
  const id = url.searchParams.get("id");
  const result = `https://cdn.videy.co/${id}.mp4`;
  
  return result;
}

module.exports = { ytdown, igdown, videyDown, mediaFireDown, tiktokDown };