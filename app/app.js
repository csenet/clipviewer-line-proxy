// require('dotenv').config({
//   debug: true
// });
const APIController = require('./ClipVieverAPI');
const LINEAPIController = require('./LINEBotAPI');
const express = require('express');
const linebot = require('@line/bot-sdk');
const app = express();
const port = 3000;
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

const client = new linebot.Client({
  channelAccessToken: process.env.LINE_ACCESS_TOKEN
});

const apiKey = process.env.apiKey;
const username = process.env.username;
const password = process.env.password;
const deviceId = process.env.ClipdeviceId;

const api = new APIController(username, password, apiKey, deviceId);
const line = new LINEAPIController(process.env.LINE_ACCESS_TOKEN);

let prevDataTimeStamp = null;

async function sendData() {
  const data = await api.getEnviromentData();
  // データの更新がない場合は送信しないようにする
  if (data.timeStamp == prevDataTimeStamp) return;
  const messages = getMessage(data);
  if (messages.length != 0) {
    await line.sendMessages(messages);
  }
  prevDataTimeStamp = data.timeStamp;
  console.log("New Data received:" + data.timeStamp);
}

function getMessage(data) {
  let messages = [];
  if (data.temprature > 30) {
    messages.push({
      type: "text",
      text: "暑いー気温下げてー"
    });
  }
  if (data.humidity < 30) {
    messages.push({
      type: "text",
      text: "喉乾いたよー水がほしいー"
    });
  }
  return messages;
}

async function main() {
  await api.issueAccessToken();
  await sendData();
  setInterval(sendData, 1 * 60 * 1000);
  setInterval(api.issueAccessToken, 5 * 60 * 1000);
}

app.get('/', (req, res) => {
  res.sendStatus(200);
})

const crypto = require("crypto");

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const signature = crypto
    .createHmac("SHA256", channelSecret)
    .update(Buffer.from(JSON.stringify(req.body)))
    .digest("base64");
  if (req.headers['x-line-signature'] != signature) {
    console.log("Invalid signature");
    return;
  }
  if (req.body.events[0].type == "message") {
    const text = req.body.events[0].message.text; // ユーザーからのメッセージ
    const replyToken = req.body.events[0].replyToken;
    // ここら辺を書き換えてあげれば返信できる
    await client.replyMessage(replyToken, {
      type: "text",
      text: text + "って言った？" // ユーザに返信するメッセージ
    });
  }
});

main();

app.listen(port, () => {
  console.log(`Webhook listening at http://localhost:${port}`)
});