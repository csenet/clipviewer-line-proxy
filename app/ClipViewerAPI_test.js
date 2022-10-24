require('dotenv').config({ debug: true });
const APIController = require('./ClipVieverAPI');
const LINEAPIController = require('./LINEBotAPI.js')

const apiKey = process.env.apiKey;
const username = process.env.username;
const password = process.env.password;
const deviceId = process.env.ClipdeviceId;

const api = new APIController(username, password, apiKey, deviceId);
const line = new LINEAPIController(process.env.LINE_ACCESS_TOKEN);

async function main() {
  await api.issueAccessToken();
  const data = await api.getEnviromentData();
  const messages = [
    {
      type: "text",
      text: `新しいデータを受信しました\nCO2濃度: ${data.co2}ppm\n 温度: ${data.temprature}℃\n 湿度: ${data.humidity}%`
    }
  ]
  await line.sendMessages(messages);
}

main();