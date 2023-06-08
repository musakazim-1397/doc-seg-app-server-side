
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');   
const router = require('./routes');
const mongoose = require('mongoose');


app.use(bodyParser.json());
app.use(cors());

app.use(router);


mongoose
  .connect(
    `mongodb+srv://captn_nextJS007:uQEpRZWwOScQCOKq@cluster0.bkrr8.mongodb.net/EmiratesNBD_Doc_Seg?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });