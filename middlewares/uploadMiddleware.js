const multer = require("multer");
const path = require("path");

// Dynamic storage configuration based on file field name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/others"; // Default path

    if (file.fieldname === "avatar") {
      uploadPath = "uploads/avatars";
    } else if (file.fieldname === "banner") {
      uploadPath = "uploads/banners";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const filename = `${timestamp}${fileExtension}`;
    cb(null, filename);
  },
});

// File type filter (Only allow images)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error("Only image files are allowed"));
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Middleware for handling single file uploads
const uploadAvatar = upload.single("avatar");
const uploadBanner = upload.single("banner");

module.exports = { uploadAvatar, uploadBanner };
