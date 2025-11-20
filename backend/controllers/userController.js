const Pin = require('../models/User'); 

// Create or update PIN
exports.createPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required' });

    let existing = await Pin.findOne({});
    if (existing) {
      existing.pin = pin;
      await existing.save();
    } else {
      const newPin = new Pin({ pin });
      await newPin.save();
    }

    res.status(200).json({ message: 'PIN saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify PIN
exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required' });

    const existing = await Pin.findOne({});
    if (!existing) return res.status(404).json({ message: 'No PIN found' });

    if (existing.pin === pin) {
      res.status(200).json({ message: 'PIN verified successfully' });
    } else {
      res.status(401).json({ message: 'Incorrect PIN' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
