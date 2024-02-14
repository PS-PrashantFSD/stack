const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const ensureDirSync = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Custom deletion logic based on file type and user ID
const deleteExistingFilesExceptCurrent = (dir, userId, fileType, currentFileName) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    const userFilePattern = new RegExp(`^${userId}_(${fileType}).*`);
    files.forEach(file => {
      if (file.match(userFilePattern) && file !== currentFileName) {
        const filePath = path.join(dir, file);
        // Check if the file exists before attempting to delete
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, err => {
            if (err) throw err;
            console.log(`Previous ${fileType} file deleted: ${file}`);
          });
        } else {
          console.log(`File not found, skipping deletion: ${filePath}`);
        }
      }
    });
  });
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = file.mimetype.startsWith('image') ? './public/images' : './public/videos';
    ensureDirSync(dir);
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const userId = req.user ? req.user.id : 'anonymous';
    const fileType = file.mimetype.startsWith('image') ? 'image' : 'video';
    const dir = file.mimetype.startsWith('image') ? './public/images' : './public/videos'; // Recalculate dir here
    const fileName = `${userId}_${fileType}${path.extname(file.originalname)}`;

    // Correct the function call to match the defined function name
    deleteExistingFilesExceptCurrent(dir, userId, fileType, fileName);

    cb(null, fileName);
  }
});

  
  const upload = multer({ storage: storage });
  
  module.exports = upload;
  