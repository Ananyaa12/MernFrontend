// script: approveAll.js
// Usage: node scripts/approveAll.js
require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('../Model/PetModel');

async function run() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/petAdoptionDB';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB:', uri);

    const res = await Pet.updateMany({ status: { $ne: 'Approved' } }, { $set: { status: 'Approved' } });
    console.log('Matched:', res.matchedCount || res.n || 0);
    console.log('Modified:', res.modifiedCount || res.nModified || 0);

    const approved = await Pet.find({ status: 'Approved' }).limit(10);
    console.log('Sample approved pets:', approved.map(p => ({ id: p._id, name: p.name, filename: p.filename })));

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
