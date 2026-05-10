import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/single', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.post('/multiple', upload.array('images', 5), (req, res) => {
  if (!req.files) return res.status(400).json({ error: 'No files uploaded' });
  const urls = (req.files as any[]).map(file => `/uploads/${file.filename}`);
  res.json({ urls });
});

export default router;
