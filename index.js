const axios = require('axios');
const qs = require('qs');
const express = require('express');

const app = express();
app.use(express.json());

// get environment variable
require('dotenv').config();

// intialize customer queue
const customerQueue = [];

/***********
  ENDPOINT
************/

// entry point webhook
app.post('/', async (req, res) => {
  let data = req.body;

  let cekData = true;

  if (customerQueue.length > 0) {
    for (let i = 0; i < customerQueue.length; i++) {
      let custData = customerQueue[i];
      if (custData.room_id == data.room_id) {
        cekData = false;
        break;
      }
    }
  }

  if (cekData) {
    console.log('masuk sini');
    // add new customer to queue
    let customer = {};
    customer.room_id = data.room_id;
    customer.name = data.name;
    customerQueue.push(customer);

    try {
      // get the free agent, only assign the room that has cutomer less than 2
      let getFreeAgent = await freeAgent();
      let agent = getFreeAgent.data.agent;

      // assign free agent to customer room
      if (agent.count < process.env.LIMIT_CUSTOMER_AGENT) {
        let incomingCustomer = customerQueue.shift();
        await assignAgent(agent.id, incomingCustomer.room_id);
      }
    } catch (err) {
      console.log(err);
    }
  }

  res.json(data);
});

// welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to webhook !',
  });
});

// check customer queue
app.get('/queue', (req, res) => {
  res.json(customerQueue);
});

// check if
app.get('/cek-agent', async (req, res) => {
  let data = await freeAgent();
  res.json(data);
});

/**********************************************************
  FUNCTION FOR REQUEST TO THE QISCUS MULTICHANNEL SERVICE
***********************************************************/

// function to get free agent
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

// function to assign agent to a room
async function assignAgent(agent_id, room_id) {
  let data = qs.stringify({
    room_id: room_id,
    agent_id: agent_id,
    max_agent: '1',
  });

  let url = process.env.BASE_URL + '/api/v1/admin/service/assign_agent';

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

  await axios(config);
}

app.listen(process.env.PORT, async () => {
  console.log('Server is running on port ' + process.env.PORT);

  setInterval(async () => {
    console.log('cek queue process');
    if (customerQueue.length > 0) {
      // get free agent
      let getFreeAgent = await freeAgent();
      let agent = getFreeAgent.data.agent;

      // check if there is agent with customer less than 2
      if (agent.count < process.env.MAX_CUSTOMER_AGENT) {
        let incomingCustomer = customerQueue.shift();
        await assignAgent(agent.id, incomingCustomer.room_id);
      }
    }
  }, process.env.INTERVAL_QUEUE);
});
