import Resource from "../models/Resource.js";

// GET batch resources
export const getResources = async (req, res) => {
  try {
    const { id } = req.params; // batchId
    const resources = await Resource.find({ batchId: id });
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

export const addResource = async (req, res) => {
  try {
    const { id } = req.params; // batchId
    const { title, description } = req.body;

    let fileUrl = null;
    if (req.cloudinaryUrl) {
      fileUrl = req.cloudinaryUrl;  // Correct here: assign req.cloudinaryUrl to fileUrl
    } else if (req.file) {
      fileUrl = req.file.path;  // Correct here too
    }

    const resource = await Resource.create({
      batchId: id,
      title,
      description,
      fileUrl,
    });

    res.status(201).json({ resource });
  } catch (error) {
    res.status(500).json({ message: "Failed to add resource" });
  }
};


// EDIT resource
export const editResource = async (req, res) => {
  try {
    const { id } = req.params; // resourceId
    const { title, description } = req.body;
    let updates = { title, description };

    // Prefer req.cloudinaryUrl if uploaded via Cloudinary
    if (req.cloudinaryUrl) {
      updates.fileUrl = req.cloudinaryUrl;
    } else if (req.file) {
      updates.fileUrl = req.file.path;
    }

    const updated = await Resource.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Resource not found" });

    res.json({ resource: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update resource" });
  }
};


// DELETE resource
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params; // resourceId
    
    const deleted = await Resource.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Resource not found" });
    res.json({ message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete resource" });
  }
};
