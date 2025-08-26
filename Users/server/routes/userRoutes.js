import express from "express";
import { getUserById, updateUserById, deleteUserById} from "../controllers/userController.js";
import upload from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/auth.js"; // optional auth middleware

const router = express.Router();

router.get("/",authMiddleware, getUserById);
router.put("/",authMiddleware, updateUserById);
// router.post("/upload-image/:id", uploadAndUpdateProfileImage);

router.delete("/:id", deleteUserById);
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
   
    res.status(200).json({ imageUrl: req.file.path });
  } catch (error) { 
    res.status(500).json({ message: "Image upload failed", error });
  }
});

export default router;
