const userDetailsController = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const Details = require("../model/UserDetailsModel"); // Adjust path as necessary
const verifyToken = require('../middleware/verifyToken'); // Adjust path as necessary

cloudinary.config({ 
    cloud_name: 'dwsqva6cj', 
    api_key: '451457421815733', 
    api_secret: 'ziys4s_P7mmRI-q_xlpvCBHTb1Q'
  });

// Multer setup for parsing multipart/form-data
const upload = multer();


// Helper function for uploading files to Cloudinary
const uploadToCloudinary = (file, folderName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folderName, resource_type: 'auto' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
};

// Get user details
userDetailsController.get('/view/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const details = await Details.findOne({ userId }).populate('userId', '-password');

        if (!details) {
            return res.status(404).json({ message: "User details not found." });
        }

        // Return the details directly as URLs are already Cloudinary URLs
        return res.status(200).json(details);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Add new details with Cloudinary file upload
userDetailsController.post('/add', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        let imagePath = null, videoPath = null;

        if (req.files['image'] && req.files['image'][0]) {
            const imageResult = await uploadToCloudinary(req.files['image'][0], 'user_images');
            imagePath = imageResult.secure_url;
        }

        if (req.files['video'] && req.files['video'][0]) {
            const videoResult = await uploadToCloudinary(req.files['video'][0], 'user_videos');
            videoPath = videoResult.secure_url;
        }

        const details = await Details.create({
            ...req.body,
            userId: req.user.id,
            image: imagePath,
            video: videoPath
        });

        return res.status(201).json(details);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Update existing details with Cloudinary file upload
userDetailsController.put('/update/:id', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const details = await Details.findById(req.params.id);
        if (!details) {
            return res.status(404).json({ message: "Details not found" });
        }

        if (details.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only update your own details" });
        }

        const updates = {};

        if (req.files['image'] && req.files['image'][0]) {
            const imageResult = await uploadToCloudinary(req.files['image'][0], 'user_images');
            updates.image = imageResult.secure_url;
        }

        if (req.files['video'] && req.files['video'][0]) {
            const videoResult = await uploadToCloudinary(req.files['video'][0], 'user_videos');
            updates.video = videoResult.secure_url;
        }

        const updatedDetails = await Details.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });

        return res.status(200).json(updatedDetails);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = userDetailsController;
