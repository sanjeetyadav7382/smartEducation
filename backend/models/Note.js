const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
    content: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
