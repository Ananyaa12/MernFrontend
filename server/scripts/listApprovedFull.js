// script: listApprovedFull.js
// Usage: node scripts/listApprovedFull.js
require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('../Model/PetModel');

async function run() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/petAdoptionDB';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB:', uri);

    const approved = await Pet.find({ status: 'Approved' }).limit(10).lean();
    console.log('Approved pets sample (full docs):');
    approved.forEach((p, i) => {
      console.log(`--- Pet ${i + 1} ---`);
      console.log(JSON.stringify(p, null, 2));
    });

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
