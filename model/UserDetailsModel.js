const mongoose = require('mongoose');

const detailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
    required: [true, 'User image is required'],
  },
  video: {
    type: String,
    required: [true, 'User video is required'],
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Details = mongoose.model('Details', detailsSchema);

module.exports = Details;
