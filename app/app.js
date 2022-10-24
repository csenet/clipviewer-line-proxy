const APIController = require('./ClipVieverAPI');
const LINEAPIController = require('./LINEBotAPI');

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

async function getMessage(data) {
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

main();