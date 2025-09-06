import express from 'express';
import {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatcheStudent
} from '../controllers/batchController.js';

import {
  getResources,
  addResource,
  editResource,
  deleteResource,
} from "../controllers/resourceController.js";
import {upload,uploadToCloudinary} from "../middleware/uploadMiddleware.js"; // your multer setup
import {authMiddleware} from '../middleware/auth.js';

const router = express.Router();

// Protect all batch routes
router.use(authMiddleware);

router.post('/', createBatch);
router.get('/', getBatches);
router.get('/:id', getBatchById);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

// fetching all students of batch 
router.get('/:batchId/students', getBatcheStudent);

// manage resources
router.get("/:id/resources", getResources);
router.post("/:id/AddResources", upload.single("file"),uploadToCloudinary, addResource);
router.put("/:id/EditResource", upload.single("file"),uploadToCloudinary, editResource);
router.delete("/:id/DelResource", deleteResource);

export default router;
