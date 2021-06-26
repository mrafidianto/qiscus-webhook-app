const express = require('express');
const app = express();

app.post('/', async (req, res) => {
  res.json(res.data);
});

app.listen();
