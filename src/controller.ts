require('dotenv').config();

import cors from 'cors';
import bodyParser from 'body-parser'
import express from 'express';



const port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
