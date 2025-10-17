const Pet = require('../Model/PetModel');
const fs = require('fs');
const path = require('path');

const postPetRequest = async (req, res) => {
  try {
    const { name, age, area, justification, email, phone, type } = req.body;
    const { filename } = req.file;

    // Validate pet type
    const validPetTypes = ['Cat', 'Dog', 'Hamster', 'Parrot', 'Rabbit'];
    if (!validPetTypes.includes(type)) {
      return res.status(400).json({ 
        error: `Invalid pet type. Must be one of: ${validPetTypes.join(', ')}` 
      });
    }

    // Validate that filename exists
    if (!filename) {
      return res.status(400).json({ 
        error: 'Image file is required' 
      });
    }

    // Verify the uploaded file exists
    const imagePath = path.join(__dirname, '../images', filename);
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ 
        error: 'Uploaded image file not found' 
      });
    }

    const pet = await Pet.create({
      name,
      age,
      area,
      justification,
      email,
      phone,
      type,
      filename,
      status: 'Pending'
    });

    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, phone, status } = req.body;
    const pet = await Pet.findByIdAndUpdate(id, { email, phone, status }, { new: true });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.status(200).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const allPets = async (reqStatus, req, res) => {
  try {
    const data = await Pet.find({ status: reqStatus }).sort({ updatedAt: -1 }).lean();

    // Normalize documents to match client expectations
    const defaultFilename = '1718906085691-433161642.jpeg';
    const mapped = (data || []).map((d) => ({
      _id: d._id,
      name: d.name || '',
      type: d.type || '',
      age: d.age || '',
      area: d.area || d.location || '',
      justification: d.justification || d.description || '',
      email: (d.email || (d.owner && d.owner.email)) || '',
      phone: (d.phone || (d.owner && d.owner.phone)) || '',
      filename: d.filename || defaultFilename,
      status: d.status || '',
      updatedAt: d.updatedAt
    }));

    // Always return 200 with an array (empty if no records) so frontend can handle it uniformly
    res.status(200).json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const pet = await Pet.findByIdAndDelete(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    const filePath = path.join(__dirname, '../images', pet.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Return all pets (no status filter) - useful for Postman
const getAllPets = async (req, res) => {
  try {
    const data = await Pet.find().sort({ updatedAt: -1 }).lean();
    const defaultFilename = '1718906085691-433161642.jpeg';
    const mapped = (data || []).map((d) => ({
      _id: d._id,
      name: d.name || '',
      type: d.type || '',
      age: d.age || '',
      area: d.area || d.location || '',
      justification: d.justification || d.description || '',
      email: (d.email || (d.owner && d.owner.email)) || '',
      phone: (d.phone || (d.owner && d.owner.phone)) || '',
      filename: d.filename || defaultFilename,
      status: d.status || '',
      updatedAt: d.updatedAt
    }));
    res.status(200).json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const id = req.params.id;
    const d = await Pet.findById(id).lean();
    if (!d) return res.status(404).json({ error: 'Pet not found' });
    const defaultFilename = '1718906085691-433161642.jpeg';
    const mapped = {
      _id: d._id,
      name: d.name || '',
      type: d.type || '',
      age: d.age || '',
      area: d.area || d.location || '',
      justification: d.justification || d.description || '',
      email: (d.email || (d.owner && d.owner.email)) || '',
      phone: (d.phone || (d.owner && d.owner.phone)) || '',
      filename: d.filename || defaultFilename,
      status: d.status || '',
      updatedAt: d.updatedAt
    };
    res.status(200).json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a pet via JSON (no image upload) - filename optional
const createPetJson = async (req, res) => {
  try {
    const { name, age, area, justification, email, phone, type, filename, status } = req.body;
    
    // Validate pet type
    const validPetTypes = ['Cat', 'Dog', 'Hamster', 'Parrot', 'Rabbit'];
    if (!validPetTypes.includes(type)) {
      return res.status(400).json({ 
        error: `Invalid pet type. Must be one of: ${validPetTypes.join(', ')}` 
      });
    }

    // If filename is provided, verify it exists
    const finalFilename = filename || '1718906085691-433161642.jpeg';
    if (filename) {
      const imagePath = path.join(__dirname, '../images', filename);
      if (!fs.existsSync(imagePath)) {
        return res.status(400).json({ 
          error: 'Specified image file not found' 
        });
      }
    }

    const pet = await Pet.create({
      name,
      age,
      area,
      justification,
      email,
      phone,
      type,
      filename: finalFilename,
      status: status || 'Pending'
    });
    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Partial update
const updatePet = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    
    // Validate pet type if provided
    if (updates.type) {
      const validPetTypes = ['Cat', 'Dog', 'Hamster', 'Parrot', 'Rabbit'];
      if (!validPetTypes.includes(updates.type)) {
        return res.status(400).json({ 
          error: `Invalid pet type. Must be one of: ${validPetTypes.join(', ')}` 
        });
      }
    }

    // Validate filename if provided
    if (updates.filename) {
      const imagePath = path.join(__dirname, '../images', updates.filename);
      if (!fs.existsSync(imagePath)) {
        return res.status(400).json({ 
          error: 'Specified image file not found' 
        });
      }
    }

    const pet = await Pet.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.status(200).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  postPetRequest,
  approveRequest,
  deletePost,
  allPets,
  getAllPets,
  getPetById,
  createPetJson,
  updatePet
};


