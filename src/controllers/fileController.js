import File from "../models/fileModel.js"
import s3 from "../utils/s3Config.js";
import Package from "../models/packageModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";



export const uploadFiles = async (req, res) => {
    try {
        const userID = req.user.id;
        console.log('Uploaded Files:', req.files);

        // Ensure files are uploaded and not undefined or empty
        if (!req.files || req.files.length === 0) {
            console.error('No files uploaded');
            return res.status(400).send('No files uploaded');
        }

        const fileUploadPromises = req.files.map(async (file) => {
            // Check if the file object is missing the size property
            if (!file || typeof file.size === 'undefined') {
                console.error('Invalid file:', file);
                throw new Error('File is invalid or missing size property');
            }

            try {
                // Log the file object to see its properties
                console.log('File Properties:', file);

                // Upload file to S3
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                };

                const s3Response = await s3.upload(params).promise();
                console.log(`File ${file.originalname} uploaded to S3:`, s3Response);

                // Save file information to the database
                const newFile = new File({
                    userID: userID,
                    fileUrl: s3Response.Location,
                    fileName: file.originalname,
                    size: file.size, // Ensure file.size exists
                    mimetype: file.mimetype,
                });

                await newFile.save();
                console.log(`File ${file.originalname} saved to database`);

                return s3Response;
            } catch (s3Error) {
                console.error(`Error uploading file ${file.originalname} to S3:`, s3Error);
                throw s3Error;
            }
        });

        // Wait for all files to be uploaded
        const uploadedFiles = await Promise.all(fileUploadPromises);

        // Send success response with uploaded files data
        res.status(200).json({
            message: 'Files uploaded successfully',
            data: uploadedFiles,
        });
    } catch (error) {
        console.error('Error in uploadFiles:', error);
        res.status(500).json({ error: 'An unexpected error occurred, please try again later.' });
    }
};



export const checkStorageLimit = async (req, res, next) => {
    try {
        const userID = req.user.id;

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


export const fileList = catchAsync(async (req, res , next) => {
     const {id} = req.user;

     const fileList = await File.find({userID: id});
     if (!fileList) {
         return next( new AppError("No file found", 200));
     }
     res.status(200).json({status: "success", data: fileList});
});


export const startedFile = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const file = await File.findById(id);
    if (!file) {
        return next(new AppError("No file found", 404));
    }
    file.starred = true;
    await file.save();
    res.status(200).json({
        status: "success",
        message: "Successfully starred",
    });
});


export const unstarredFile = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const file = await File.findById(id);
    if (!file) {
        return next(new AppError("No file found", 404));
    }
    file.starred = false;  // Set the starred field to false
    await file.save();
    res.status(200).json({
        status: "success",
        message: "Successfully unstarred",
    });
});


//user file
export const  getAdminUserFile = catchAsync(async (req, res , next) => {
    const userID = req.user.id;
    const user = await User.findOne({_id:userID});
    if (!user) {
        return next(new AppError("No user found!",401));
    }

    const adminFile = await File.find({userID: user.adminID});
    res.status(200).json({status: "success", data: adminFile});
})




