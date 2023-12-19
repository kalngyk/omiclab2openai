require('dotenv').config();
const vercelJSON = {
  // your vercel.json configuration here
};
const fs = require('fs');
fs.writeFileSync('./vercel.json', JSON.stringify(vercelJSON));
