const express = require('express');
const app = express();

app.use(express.json());

const customerQueue = [];

app.post('/', async (req, res) => {
  let data = req.body;

  // add new customer to queue
  let customer = {};
  customer.room_id = data.room_id;
  customer.name = data.name;
  customer.source = data.source;
  customerQueue.push(customer);

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

app.listen(5000, () => {
  console.log('start server on port 5000');
});
