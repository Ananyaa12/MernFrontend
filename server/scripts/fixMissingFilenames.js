// script: fixMissingFilenames.js
// Usage: node scripts/fixMissingFilenames.js
require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('../Model/PetModel');

async function run() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/petAdoptionDB';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB:', uri);

    // Choose a default filename that exists in the images folder
    const defaultFilename = '1718906085691-433161642.jpeg';

    const res = await Pet.updateMany({ filename: { $exists: false } }, { $set: { filename: defaultFilename } });
    console.log('Matched:', res.matchedCount || res.n || 0);
    console.log('Modified:', res.modifiedCount || res.nModified || 0);

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
