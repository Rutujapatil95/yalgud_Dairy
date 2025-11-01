const Offer = require('../models/Offer');
const path = require('path');

// Get all offers
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new offer
exports.addOffer = async (req, res) => {
  try {
    const { title } = req.body;
    const image = `/uploads/${req.file.filename}`;
    const newOffer = new Offer({ title, image });
    await newOffer.save();
    res.status(201).json(newOffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
