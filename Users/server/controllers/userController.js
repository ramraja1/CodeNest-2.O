import cloudinary from "cloudinary"; // or your cloudinary config import
import User from "../models/user.js"; // adjust path as needed
import fs from "fs";
// Fetch user profile by ID
export async function getUserById(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate("collegeId batches solvedQuestions contestStats.contestId")
      .exec();

    if (!user) return res.status(404).json({ error: "User not found" });

    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Update user profile by ID
export async function updateUserById(req, res) {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    delete updateData.password; // prevent password change here
    delete updateData.role; // prevent role change

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Delete user by ID
export async function deleteUserById(req, res) {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId).exec();

    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Server error" });
  }
}


// Assuming you are using multer and the image file is available as req.file

// export async function uploadAndUpdateProfileImage(req, res) {
//   try {
//     const userId = req.params.id;

//     if (!req.file) {
//       return res.status(400).json({ error: "No image file uploaded" });
//     }

//     // Upload image to Cloudinary (or your storage service)
//     const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
//       folder: "profile_images",
//       width: 500,
//       height: 500,
//       crop: "fill",
//     });

//     // Optionally delete the local file after upload
//     fs.unlinkSync(req.file.path);

//     // Update user's avatarUrl with the Cloudinary URL
//     // const updatedUser = await User.findByIdAndUpdate(
//     //   userId,
//     //   { avatarUrl: uploadResult.secure_url },
//     //   { new: true, runValidators: true }
//     // ).exec();

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({
//       message: "Profile image updated successfully",
//       avatarUrl: updatedUser.avatarUrl,
//     });
//   } catch (err) {
//     console.error("Profile image upload/update error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }
