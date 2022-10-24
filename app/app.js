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
  if (data.timeStamp == prevDataTimeStamp) return;
  const messages = [{
    type: "text",
    text: `新しいデータを受信しました\nCO2濃度: ${data.co2}ppm\n 温度: ${data.temprature}℃\n 湿度: ${data.humidity}%`
  }]
  await line.sendMessages(messages);
  prevDataTimeStamp = data.timeStamp;
  console.log("New Data received:" + data.timeStamp);
}

async function main() {
  await api.issueAccessToken();
  await sendData();
  setInterval(sendData, 1 * 60 * 1000);
  setInterval(api.issueAccessToken, 5 * 60 * 1000);
}

main();