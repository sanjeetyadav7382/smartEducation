const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/login
// @desc    Mock login / auto-create user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
        // Quick mock logic for tutorial: check if exists, otherwise create
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({ email, password });
            return res.status(201).json({ message: "Account Created & Logged In!", user });
        }
        
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful 🎉", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
