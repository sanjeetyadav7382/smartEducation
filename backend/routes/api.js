const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');
const Session = require('../models/Session');

// @route   GET /api/notes
// @desc    Get all notes
router.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   POST /api/notes
// @desc    Create a note
router.post('/notes', async (req, res) => {
    try {
        const { content } = req.body;
        const note = await Note.create({ content });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   GET /api/quizzes
// @desc    Get all quizzes
router.get('/quizzes', async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   POST /api/sessions
// @desc    Create a study session record
router.post('/sessions', async (req, res) => {
    try {
        const { durationMinutes, averageFocusScore } = req.body;
        const session = await Session.create({ durationMinutes, averageFocusScore });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
