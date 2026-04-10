const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
    durationMinutes: { type: Number, required: true },
    averageFocusScore: { type: Number, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
