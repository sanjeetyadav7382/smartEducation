const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studyStreak: { type: Number, default: 0 },
    focusTimeToday: { type: Number, default: 0 },
    weeklyGoalProgress: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
