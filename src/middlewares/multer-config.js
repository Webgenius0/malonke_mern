import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

// File filter function to check valid file types
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        return cb(new Error('Error: File type not supported!'));
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
    fileFilter: fileFilter,
});

export default upload;
