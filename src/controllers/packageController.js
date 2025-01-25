import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Admin from "../models/adminModel.js";
import Package from "../models/packageModel.js";


export const createPackage = catchAsync(async (req, res, next) => {
    const { planID, userID } = req.body;

    if (!userID) {
        return next(new AppError('User ID is required', 400));
    }
    if (!planID) {
        return next(new AppError('Plan ID is required', 400));
    }

    const isValidUser = await Admin.findById(userID);
    if (!isValidUser) {
        return next(new AppError('Invalid User ID', 400));
    }

    const existingPackage = await Package.findOne({ userID, planID });

    if (existingPackage) {
        existingPackage.updatedAt = Date.now();
        await existingPackage.save();
        return res.status(200).json({
            status: 'success',
            message: 'Package updated successfully',
            data: { package: existingPackage },
        });
    }

    const otherPackage = await Package.findOne({ userID });
    if (otherPackage) {
        otherPackage.planID = planID;
        otherPackage.updatedAt = Date.now();
        await otherPackage.save();
        return res.status(200).json({
            status: 'success',
            message: 'Package updated to a new plan successfully',
            data: { package: otherPackage },
        });
    }

    const newPackage = await Package.create({ userID, planID });
    return res.status(201).json({
        status: 'success',
        message: 'Package created successfully',
        data: { package: newPackage },
    });
});
