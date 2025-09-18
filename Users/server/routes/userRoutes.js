import express from "express";
import {
  getUserById,
  updateUserById,
  deleteUserById,
  changePassword,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";
import { upload, uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/auth.js"; // optional auth middleware

const router = express.Router();

router.get("/", authMiddleware, getUserById);
router.put("/", authMiddleware, updateUserById);
// router.post("/upload-image/:id", uploadAndUpdateProfileImage);

router.delete("/:id", deleteUserById);
router.post(
  "/upload-image",
  upload.single("image"),
  uploadToCloudinary, // ye middleware Cloudinary pe upload karke req.cloudinaryUrl add karega
  (req, res) => {
    if (!req.cloudinaryUrl) {
      return res.status(400).json({ message: "File upload failed" });
    }
    res.status(200).json({ imageUrl: req.cloudinaryUrl });
  }
);

router.post("/change-password",authMiddleware,changePassword);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);
export default router;
