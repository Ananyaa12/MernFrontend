const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { postPetRequest, approveRequest, deletePost, allPets, getAllPets, getPetById, createPetJson, updatePet } = require('../Controller/PetController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/requests', (req, res) => allPets('Pending', req, res));
router.get('/approvedPets', (req, res) => allPets('Approved', req, res));
router.get('/adoptedPets', (req, res) => allPets('Adopted', req, res));
router.post('/services', upload.single('picture'), postPetRequest);
router.put('/approving/:id', approveRequest);
router.delete('/delete/:id', deletePost);

// RESTful endpoints for Postman / API clients
router.get('/pets', getAllPets);
router.get('/pets/:id', getPetById);
router.post('/pets', createPetJson);
router.put('/pets/:id', updatePet);
router.delete('/pets/:id', deletePost);

module.exports = router;
