const express = require('express');
const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
  let data = req.body;
  console.log(data);
  res.json(data);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to webhook !',
  });
});

app.listen(5000, () => {
  console.log('start server on port 5000');
});
