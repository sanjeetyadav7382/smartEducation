const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: Number, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
