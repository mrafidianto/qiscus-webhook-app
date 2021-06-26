const axios = require('axios');
const qs = require('qs');
const express = require('express');

const app = express();
app.use(express.json());

// get environment variable
require('dotenv').config();

// intialize customer queue
const customerQueue = [];

// ENDPOINT
app.post('/', async (req, res) => {
  let data = req.body;

  // add new customer to queue
  let customer = {};
  customer.room_id = data.room_id;
  customer.name = data.name;
  customer.source = data.source;
  customerQueue.push(customer);

  // get the free agent, only assign the room that has cutomer less than 2
  let getFreeAgent = freeAgent();
  let freeAgent = getFreeAgent.data;

  res.json(data);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to webhook !',
  });
});

app.get('/queue', (req, res) => {
  res.json(customerQueue);
});

app.get('/cek_agent', async (req, res) => {
  let data = await freeAgent();
  res.json(data);
});

// FUNCTION FOR REQUEST TO THE QISCUS MULTICHANNEL SERVICE
async function freeAgent() {
  let data = qs.stringify({
    source: 'qiscus',
    ignore_availability: '',
    channel_id: '',
  });

  let url = process.env.BASE_URL + '/api/v1/admin/service/allocate_agent';

  let config = {
    method: 'post',
    url: url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Qiscus-App-Id': process.env.APP_ID,
      'Qiscus-Secret-Key': process.env.SECRET_KEY,
    },
    data: data,
  };

  let res = await axios(config);
  return res.data;
}

app.listen(5000, () => {
  console.log('start server on port 5000');
});
