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
let data = null;

async function sendData() {
  data = await api.getEnviromentData();
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
  if (data.humidity < 15) {
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
    // こんな感じにtext==""とか条件を指定してあげれば大丈夫
    if (data == null) {
      await client.replyMessage(replyToken, {
        type: "text",
        text: "まだ、データが取得できていません"
      });
      return;
    }
    if (text == "しりとり") {
      await client.replyMessage(replyToken, {
        type: "text",
        text: "りんご"
      });
    } else if (text == "水は足りてる？") {
      if (data.humidity < 30) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "お水欲しいかな！！！"
        });
      } else if (data.humidity > 30) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "お水は足りてるよ、ありがとう！"
        });
      }
    } else if (text == "部屋の空気は綺麗かな") {
      if (data.co2 >= 1500) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "換気したほうがいいかも！"
        });
      } else if (data.temprature < 1500) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "空気は綺麗だよ！大丈夫！"
        });
      }
    } else if (text == "気分はどう？") {
      if (data.temprature >= 30) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "ちょっと熱いかな！"
        });
      } else if (data.temprature >= 15 && data.temprature < 30) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "超快適さ！"
        });
      } else if (data.temprature < 15) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "ちょっと冷えてきたかな、ガクガクブルブル"
        });
      }
    } else if (text == "けつ") {
      await client.replyMessage(replyToken, {
        type: "text",
        text: "ごちけつ？"
      });
    } else if (text == "おはよう！") {
      await client.replyMessage(replyToken, {
        type: "text",
        text: "おはよう！！"
      });
    }else if (text == "こんにちは！") {
      await client.replyMessage(replyToken, {
        type: "text",
        text: "こにゃにゃちわ！"
      });
    }else if (text == "元気いっぱいに育ってね") {
      await client.replyMessage(replyToken, {
        type: "text",
        text: "うん！すくすく大きくなるね！"
      });
    }else if (text == "今日の服は何がいいだろう") {
     if (data.temprature >= 25) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "今日は暑そうだから涼しい服がいいと思うよ！"
        });
      } else if (data.temprature >= 15 && data.temprature < 25) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "今日はちょうどいい気温みたいだね、秋服とか春服とかどうだろう？"
        });
      } else if (data.temprature < 15) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "今日は寒そう、暖かい服がいいと思う！"
        });
      }
    }else {
      await client.replyMessage(replyToken, {
        type: "text",
        text: "おっ、そうだな！！！！"
      });
    }
  }
});

main();

app.listen(port, () => {
  console.log(`Webhook listening at http://localhost:${port}`)
});
