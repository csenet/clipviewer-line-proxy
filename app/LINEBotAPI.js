const axios = require('axios');

module.exports = class LINEAPIController {

  constructor(channelAccessToken) {
    this.accessToken = channelAccessToken;
  }

  async sendMessages(messages) {
    var axios = require('axios');
    var data = JSON.stringify({
      "messages": messages
    });

    var config = {
      method: 'post',
      url: 'https://api.line.me/v2/bot/message/broadcast',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios(config);
    return JSON.stringify(response.data);
  }
}