const express = require('express');
const router = express.Router();
const { FoodItem } = require('../models');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const upload = multer({ dest: '/tmp/' });

// GET /food - List all available food items (Public)
router.get('/', async (req, res) => {
  try {
    const foodItems = await FoodItem.findAll({ where: { isAvailable: true } });
    res.json(foodItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /food - Add new food item (Admin Only)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, isAvailable } = req.body;
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'transly_food' });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // clean up tmp
    }

    const foodItem = await FoodItem.create({
      name,
      description,
      price: parseFloat(price) || 0,
      isAvailable: isAvailable !== 'false',
      imageUrl,
    });

    res.status(201).json(foodItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding food item' });
  }
});

// PUT /food/:id - Update food item (Admin Only)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, isAvailable } = req.body;
    
    const foodItem = await FoodItem.findByPk(id);
    if (!foodItem) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Food item not found' });
    }

    let imageUrl = foodItem.imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'transly_food' });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    await foodItem.update({
      name: name !== undefined ? name : foodItem.name,
      description: description !== undefined ? description : foodItem.description,
      price: price !== undefined ? parseFloat(price) : foodItem.price,
      isAvailable: isAvailable !== undefined ? isAvailable !== 'false' : foodItem.isAvailable,
      imageUrl,
    });

    res.json(foodItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating food item' });
  }
});

// DELETE /food/:id - Delete food item (Admin Only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const foodItem = await FoodItem.findByPk(id);
    if (!foodItem) return res.status(404).json({ message: 'Food item not found' });

    await foodItem.destroy();
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting food item' });
  }
});

module.exports = router;
