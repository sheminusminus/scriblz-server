import fs from 'fs';
import path from 'path';

import nodemon from 'nodemon';
import ngrok from 'ngrok';


const writeUrl = (publicUrl) => {
  const filePath = path.resolve(__dirname, '../', '._scriblz');
  fs.writeFileSync(filePath, publicUrl, 'utf-8');
};

const connectToProxy = async () => ngrok.connect(4000);

const start = () => {
  nodemon(`--watch src --ext ts --exec 'npm start'`);
  nodemon.on('start', async () => {
    const publicUrl = await connectToProxy();
    console.log(`app proxy available at ${publicUrl}`);
    writeUrl(publicUrl);
  });
};

start();
