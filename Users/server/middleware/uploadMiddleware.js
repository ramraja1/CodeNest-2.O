// middleware/uploadMiddleware.js
import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";

// Multer stores file locally in /uploads before sending to Cloudinary
const upload = multer({ dest: "uploads/" });

// Middleware to handle Cloudinary upload
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "CodeNest-Profile", // same folder you used earlier
      allowed_formats: ["jpg", "png", "jpeg"],
    });

    req.cloudinaryUrl = result.secure_url; // attach Cloudinary URL to request
    fs.unlinkSync(req.file.path); // delete local temp file
    next();
  } catch (error) {
    next(error);
  }
};

export { upload, uploadToCloudinary };
