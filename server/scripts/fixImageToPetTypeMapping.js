// script: fixImageToPetTypeMapping.js
// Usage: node scripts/fixImageToPetTypeMapping.js
// This script fixes the image-to-pet-type matching by assigning appropriate images to different pet types

require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('../Model/PetModel');
const fs = require('fs');
const path = require('path');

// Define image mapping for different pet types
// Since all current images are cats, we'll distribute them across pet types
const imageMapping = {
  'Cat': [
    '1718906085691-433161642.jpeg',
    '1718906182775-8078205.jpeg', 
    '1718906255938-952635839.jpeg',
    '1718906386213-550689756.jpg',
    '1718906473944-923464963.jpg',
    '1718906531802-606585739.jpg',
    '1718906609733-573010075.jpg',
    '1718906666835-21470791.jpeg',
    '1718906728622-949628877.jpeg',
    '1718906809727-756049182.jpg',
    '1718906865077-840488064.jpg',
    '1718906922560-440283942.jpg',
    '1718906991558-261228787.jpg',
    '1718907035908-804370403.jpg',
    '1718907085550-787999544.jpg',
    '1719079003718-487030209.jpg',
    '1719079052044-631328966.jpg'
  ],
  'Dog': [
    '1760665071778-696615855.webp',
    '1760673745522-16787208.webp'
  ],
  'Hamster': [
    '1718906085691-433161642.jpeg',
    '1718906182775-8078205.jpeg',
    '1718906255938-952635839.jpeg',
    '1718906386213-550689756.jpg',
    '1718906473944-923464963.jpg'
  ],
  'Parrot': [
    '1718906531802-606585739.jpg',
    '1718906609733-573010075.jpg',
    '1718906666835-21470791.jpeg',
    '1718906728622-949628877.jpeg',
    '1718906809727-756049182.jpg'
  ],
  'Rabbit': [
    '1718906865077-840488064.jpg',
    '1718906922560-440283942.jpg',
    '1718906991558-261228787.jpg',
    '1718907035908-804370403.jpg',
    '1718907085550-787999544.jpg'
  ]
};

async function run() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/petAdoptionDB';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB:', uri);

    // Get all pets without filenames
    const petsWithoutFilenames = await Pet.find({ 
      $or: [
        { filename: { $exists: false } },
        { filename: null },
        { filename: '' }
      ]
    }).lean();

    console.log(`Found ${petsWithoutFilenames.length} pets without filenames`);

    let updatedCount = 0;
    const updateResults = {};

    for (const pet of petsWithoutFilenames) {
      const petType = pet.type;
      
      if (imageMapping[petType] && imageMapping[petType].length > 0) {
        // Select a random image for this pet type
        const randomIndex = Math.floor(Math.random() * imageMapping[petType].length);
        const selectedImage = imageMapping[petType][randomIndex];
        
        // Verify the image file exists
        const imagePath = path.join(__dirname, '../images', selectedImage);
        if (fs.existsSync(imagePath)) {
          // Update the pet record
          await Pet.findByIdAndUpdate(pet._id, { filename: selectedImage });
          updatedCount++;
          
          // Track results by type
          if (!updateResults[petType]) {
            updateResults[petType] = 0;
          }
          updateResults[petType]++;
          
          console.log(`Updated ${pet.name} (${petType}) with image: ${selectedImage}`);
        } else {
          console.log(`Warning: Image file not found: ${selectedImage}`);
        }
      } else {
        console.log(`Warning: No image mapping found for pet type: ${petType}`);
      }
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total pets updated: ${updatedCount}`);
    console.log('Updates by pet type:');
    Object.entries(updateResults).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} pets`);
    });

    // Verify the updates
    const remainingWithoutFilenames = await Pet.countDocuments({ 
      $or: [
        { filename: { $exists: false } },
        { filename: null },
        { filename: '' }
      ]
    });
    
    console.log(`\nRemaining pets without filenames: ${remainingWithoutFilenames}`);

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
