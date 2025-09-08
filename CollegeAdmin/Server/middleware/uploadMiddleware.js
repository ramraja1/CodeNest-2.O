// middleware/uploadMiddleware.js
import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";
import path from "path";
// Multer stores file locally in /uploads before sending to Cloudinary
const upload = multer({ dest: "uploads/" });

// Middleware to handle Cloudinary upload

const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const ext = path.extname(req.file.originalname); // get original file extension
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "CodeNest-Batches-Resources",
      resource_type: "raw",
      public_id: req.file.filename + ext, // preserve extension in public_id
    });

    req.cloudinaryUrl = result.secure_url;
    fs.unlinkSync(req.file.path);
    next();
  } catch (error) {
    next(error);
  }
};

export { upload, uploadToCloudinary };
