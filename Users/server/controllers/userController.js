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
import bcrypt from 'bcryptjs';

export const changePassword = async (req, res) => {

  const userId = req.user._id; // from JWT auth middleware

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  
  if (!isMatch) {
    return res.status(400).json({ msg: 'Old password is incorrect' });
  }

  const hashedNew = await bcrypt.hash(newPassword, 10);
  user.password = hashedNew;
  await user.save();
  
  res.json({ msg: 'Password changed successfully' });
};

import crypto from "crypto";

import { sendResetEmail } from "../utils/email.js"; // you'll create this

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // For security, respond with success even if user not found
      return res.json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving to DB for security
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token and expiration (e.g., 1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Send email with reset link (link includes resetToken)
   const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


    await sendResetEmail(user.email, resetUrl);

    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Hash the token sent by client to compare with stored hashed token

    
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token and token expiry still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Remove reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();


    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};