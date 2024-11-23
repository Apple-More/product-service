import multer from "multer";


const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as buffer
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit file size to 5MB
});

export default upload;