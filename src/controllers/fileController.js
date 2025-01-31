import File from "../models/fileModel.js"
import s3 from "../utils/s3Config.js";
import Package from "../models/packageModel.js";



export const uploadFile = async (req, res) => {
    try {
        const userID = req.user.id;

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        // Upload file to S3
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${Date.now()}_${req.file.originalname}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };

        const s3Response = await s3.upload(params).promise();

        // Save file information to the database
        const newFile = new File({
            userID: userID,
            fileUrl: s3Response.Location,
            fileName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        await newFile.save();

        res.status(200).json({ message: 'File uploaded successfully', data: s3Response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const checkStorageLimit = async (req, res, next) => {
    try {
        const userID = req.user.id;
        console.log(userID);

        // Fetch user package and plan
        const userPackage = await Package.findOne({ userID: userID }).populate('planID');
        if (!userPackage) {
            return res.status(404).send('User package not found');
        }

        const userPlan = userPackage.planID;

        // Calculate total used storage by the user
        const totalUsedStorage = await File.aggregate([
            { $match: { userID: userID } },
            { $group: { _id: null, totalSize: { $sum: "$size" } } }
        ]);

        const usedStorage = totalUsedStorage[0] ? totalUsedStorage[0].totalSize : 0;
        const newFileSize = req.file.size;
        const storageLimit = userPlan.storageLimit;

        // Check if the new file exceeds the storage limit
        if (usedStorage + newFileSize > storageLimit) {
            return res.status(400).send('Storage limit exceeded');
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const checkPackageTimeLimit = async (req, res, next) => {
    try {
        const userID = req.user.id;

        // Fetch user package
        const userPackage = await Package.findOne({ userID: userID });
        if (!userPackage) {
            return res.status(404).send('User package not found');
        }

        const currentDate = new Date();

        // Check if the package is still active
        if (currentDate > userPackage.endDate) {
            return res.status(400).send('Package time limit exceeded');
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};







