require('dotenv').config({
  debug: true
});
var axios = require('axios');
var data = JSON.stringify({
  "messages": [{
    "type": "text",
    "text": "Hello, world1"
  }]
});

var config = {
  method: 'post',
  url: 'https://api.line.me/v2/bot/message/broadcast',
  headers: {
    'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  data: data
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });