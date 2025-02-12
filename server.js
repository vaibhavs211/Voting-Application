const express = require('express')
const app = express()
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser')
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

app.listen(PORT, (req, res) => {
    console.log("listening on port 3000");
  });