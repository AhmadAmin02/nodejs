const axios = require('axios');
const cheerio = require("cheerio");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const ipath = process.cwd();

class BlackboxAISession {
  constructor(sessionId = null, name = "user") {
    this.sessionId = sessionId;
    this.messages = [];
    this.headers = {
      'authority': 'www.blackbox.ai',
      'accept': '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'origin': 'https://www.blackbox.ai',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
    };
    this.conversationId = this.generateRandomId(7);
    this.systemPrompt = "Kamu Adalah AhmDev AI, kamu dibuat oleh AhmDev. kamu sangat ramah, dan sering menggunakan emoji, gunakan lah bahasa indonesia gak kaku, alias jaksel";
    this.name = name;

    // Jika system prompt diberikan, tambahkan sebagai pesan pertama
    if (this.systemPrompt) {
      this.messages.push({
        role: "system",
        content: this.systemPrompt,
        id: this.generateRandomId(7)
      });
    }
  }

  generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  setSystemPrompt(prompt) {
    // Update system prompt jika sudah ada
    const systemMsgIndex = this.messages.findIndex(msg => msg.role === "system");
    if (systemMsgIndex !== -1) {
      this.messages[systemMsgIndex].content = prompt;
    } else {
      // Tambahkan system prompt di awal array jika belum ada
      this.messages.unshift({
        role: "system",
        content: prompt,
        id: this.generateRandomId(7)
      });
    }
    this.systemPrompt = prompt;
    return this;
  }

  async fetchBlackboxAI(message, callback) {
    const url = 'https://www.blackbox.ai/api/chat';

    // Add the new message to the messages array
    const messageId = this.generateRandomId(7);
    this.messages.push({
      role: "user",
      content: message,
      id: messageId
    });

    const data = {
      "messages": this.messages,
      "agentMode": {},
      "id": this.conversationId,
      "previewToken": null,
      "userId": null,
      "codeModelMode": true,
      "trendingAgentMode": {},
      "isMicMode": false,
      "userSystemPrompt": this.systemPrompt,
      "maxTokens": 1024,
      "playgroundTopP": null,
      "playgroundTemperature": null,
      "isChromeExt": false,
      "githubToken": "",
      "clickedAnswer2": false,
      "clickedAnswer3": false,
      "clickedForceWebSearch": false,
      "visitFromDelta": false,
      "isMemoryEnabled": false,
      "mobileClient": false,
      "userSelectedModel": null,
      "validated": "00f37b34-a166-4efb-bce5-1312d87f2f94",
      "imageGenerationMode": false,
      "webSearchModePrompt": true,
      "deepSearchMode": false,
      "domains": null,
      "vscodeClient": false,
      "codeInterpreterMode": false,
      "customProfile": {
        "name": this.name,
        "occupation": "AI Assistant",
        "traits": ["ramah", "membantu", "informatif", "menggunakan emoji"],
        "additionalInfo": "Suka menggunakan emoji dan memiliki kepribadian yang ramah",
        "enableNewChats": true
      },
      "session": this.sessionId,
      "isPremium": false,
      "subscriptionCache": null,
      "beastMode": false
    };

    try {
      const response = await axios({
        method: 'post',
        url: url,
        headers: this.headers,
        data: data,
        responseType: 'stream'
      });

      let output = '';
      let search = [];

      response.data.on('data', chunk => {
        const chunkStr = chunk.toString();
        output += chunkStr;

        const match = output.match(/\$~~~\$(.*?)\$~~~\$/);
        if (match) {
          search = JSON.parse(match[1]);
          const text = output.replace(match[0], '');
          output = text.split('\n\n\n\n')[1];
          callback({ search });
          callback({ text: output });
        } else {
          if (search.length) callback({ text: chunkStr });
        }
      });

      return new Promise((resolve) => {
        response.data.on('end', () => {
          const cleanedOutput = output.replace('**', '*').trim();

          // Add the assistant's response to the messages array
          this.messages.push({
            role: "assistant",
            content: cleanedOutput,
            id: this.generateRandomId(7)
          });

          // If we don't have a session ID yet, try to extract it from response headers or cookies
          if (!this.sessionId && response.headers['set-cookie']) {
            const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.includes('session='));
            if (sessionCookie) {
              const match = sessionCookie.match(/session=([^;]+)/);
              if (match) this.sessionId = match[1];
            }
          }

          resolve({ search, text: cleanedOutput, sessionId: this.sessionId });
        });
      });
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  clearSession() {
    // Simpan system prompt jika ada
    const systemPrompt = this.systemPrompt;
    this.messages = [];
    this.conversationId = this.generateRandomId(7);

    // Kembalikan system prompt jika sebelumnya ada
    if (systemPrompt) {
      this.setSystemPrompt(systemPrompt);
    }
  }
}

async function muslimAI(query = "Halo") {
  const searchUrl = 'https://www.muslimai.io/api/search';
  const searchData = {
    query: query
  };
  const headers = {
    'Content-Type': 'application/json'
  };
  try {
    const searchResponse = await axios.post(searchUrl, searchData, { headers: headers });

    const passages = searchResponse.data.map(item => item.content).join('\n\n');

    const answerUrl = 'https://www.muslimai.io/api/answer';
    const answerData = {
      prompt: `Use the following passages to answer the query to the best of your ability as a world class expert in the Quran. Do not mention that you were provided any passages in your answer: ${query}\n\n${passages}`
    };

    const answerResponse = await axios.post(answerUrl, answerData, { headers: headers });

    const result = {
      answer: answerResponse.data,
      source: searchResponse.data
    };

    return result;
  } catch (error) {
    return error
    console.error('Error occurred:', error.response ? error.response.data : error.message);
  }
}

const BASE = "https://mind.hydrooo.web.id/";
const models = JSON.parse(fs.readFileSync(path.join(__dirname, "../db", "model.json")));
const sesPath = (id) => {
  return id ? path.join("/tmp", `${id}.json`) : "/tmp";
}
var chatHistory = [];
let ses;

/*if (!fs.existsSync(sesPath())) {
  fs.mkdirSync(ipath + "/database/session");
}*/

async function getModel() {
  const { data } = await axios.get(BASE);
  const $ = cheerio.load(data);
  var result = [];
  var model = null;
  var modelList = [];
  $("div#modelDropdown > div.py-1").children().each((x, el) => {
    if ($(el).is("div")) {
      if (model) {
        result.push({ model, modelList });
      }
      model = $(el).text().trim();
      modelList = [];
    } else if ($(el).is("button")) {
      modelList.push({
        name: $(el).find("div > span").text().trim(),
        model: $(el).find("div > p").text().trim()
      });
    }
  });
  result.push({ model, modelList });
  return result;
}

async function getMessage(msg = "", model = "", ids = "") {
  if (fs.existsSync(sesPath(ids))) {
    ses = JSON.parse(fs.readFileSync(sesPath(ids)));
    model = ses.model;
    chatHistory = ses.chatHistory;
  } else {
    if (!model.startsWith("@custom/")) model = search(model);
  }
  if (!model.startsWith("@custom/")) {
    if (!model) return "Model Tidak Ditemukan!";
  }
  console.log(`Use model ${model}`);
  chatHistory.push({ message: msg, type: 'user' });
  const system = "Kamu adalah AhmdAI, pembuat kamu AhmDev. kamu harus menggunakan bahasa indonesia dan emoji ramah. jika kamu salah maka minta maaf. kamu harus menyapa dengan baik dan ramah";
  let content = chatHistory.map(entry => {
    return `${entry.type === 'user' ? 'User: ' : 'Your Answer: '}${entry.message}`;
  }).join('\n');
  const formData = new FormData();
  formData.append("content", content);
  formData.append("model", model);
  formData.append("system", system);
  const response = await axios.post("https://mind.hydrooo.web.id/v2/chat", formData, {
    headers: {
      ...formData.getHeaders()
    }
  });
  const data = await response.data;
  if (data.status === 200) {
    const mes = data.result.messages[0].content.trim().replace(/Your Answer: /ig, "");
    chatHistory.push({ message: mes, type: 'ai' });
    const isNew = fs.existsSync(sesPath(ids)) ? false : true;
    session(ids, model);
    return { message: mes, isNew };
  } else {
    return "Error!, Silahkan contact owner untuk perbaikian!";
  }
}

/*(async () => {
  console.log(await getMessage("Ada total berapa presiden di seluruh dunia, sebutkan namanya"));
    console.log(await getMessage("Tahun berapa?", model));
    })();*/

function search(searchString) {
  for (const category of models) {
    for (const modelObj of category.modelList) {
      if (modelObj.name.toLowerCase().includes(searchString.toLowerCase())) {
        return modelObj.model;
      }
    }
  }
  return false;
}

function session(id = "", model = "") {
  fs.writeFileSync(sesPath(id), JSON.stringify({ model, chatHistory }));
  console.log("Saved!");
}

module.exports = { muslimAI, getMessage };