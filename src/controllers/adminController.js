import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Admin from "../models/adminModel.js";
import { emailUtility } from "../utils/emailUtility.js";
import User from "../models/userModel.js";
import Package from "../models/packageModel.js";
import File from "../models/fileModel.js";
import Profile from "../models/profileModel.js";

/**
 * Create Admin Controller
 */
export const createAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const {
    username,
    firstName,
    lastName,
    phone,
    email,
    password,
    confirmPassword,
    isTermAgree,
  } = req.body;

  // Check required fields
  if (
    !username ||
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !password ||
    !confirmPassword ||
    !isTermAgree
  ) {
    return next(
      new AppError(
        "First Name, Last Name, email, password, confirmPassword, and isTermAgree are required",
        400
      )
    );
  }

  //Check password match
  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  // Check if email already exists
  const existingUser = await Admin.findOne({ email });
  if (existingUser) {
    return next(
      new AppError("An account with this email already exists.", 409)
    );
  }

  const options = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Login Credentials for TrustDocs!",
    html: `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    font-size: 24px;
                    color: #333;
                    margin: 0;
                }
                .content {
                    font-size: 16px;
                    color: #555;
                    line-height: 1.6;
                }
                .credentials {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 10px;
                }
                .credentials p {
                    margin: 8px 0;
                    font-size: 14px;
                }
                .footer {
                    text-align: center;
                    font-size: 14px;
                    color: #888;
                    margin-top: 20px;
                }
                .footer p {
                    margin: 0;
                    font-weight: 500;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your Login Credentials</h1>
                </div>
                <div class="content">
                    <p>Hi <strong>${firstName} ${lastName}</strong>,</p>
                    <p>
                        Welcome to TrustDocs! Here are your login credentials. Please keep them secure and do not share them
                        with anyone:
                    </p>
                    <div class="credentials">
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Username:</strong> ${username}</p>
                        <p><strong>Password:</strong> ${password}</p>
                        <p><strong>Role:</strong> admin</p>
                    </div>
                    <p>
                        You can log in using the above credentials at the following link:
                        <br/>
                        <a href="${process.env.ORIGIN_URL}/login" style="color: #29ABE2;">Login to TrustDocs</a>
                    </p>
                    <p>
                        If you have any questions or face any issues, feel free to reach out to our support team.
                    </p>
                </div>
                <div class="footer">
                    <p>Thank you,</p>
                    <p>The TrustDocs Team</p>
                </div>
            </div>
        </body>
        </html>
    `,
  };

  await emailUtility(options, next);

  // Create new user in a pending state
  const newAdmin = await Admin.create({
    username,
    firstName,
    lastName,
    email,
    phone,
    password,
    isTermAgree,
    superAdminID: id,
  });

  await Profile.create({
    userID: newAdmin._id,
    avatar: "https://cdn.vectorstock.com/i/500p/77/30/default-avatar-profile-icon-grey-photo-placeholder-vector-17317730.jpg",
  });

  res
    .status(201)
    .json({ status: "success", message: "Admin Created successfully!" });
});

// Get all admin controller
export const getAllAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Create a regex for case-insensitive search
    const searchRegex = new RegExp(keyword, "i");

    // Use a single aggregation with $facet for data and total count
    const results = await Admin.aggregate([
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "userID",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
          ],
        },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNumber },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                username: 1,
                email: 1,
                createdAt: 1,
                profile: {
                  avatar: "$profile.avatar",
                },
              },
            },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
    ]);

    const adminsWithAvatars = results[0].data;
    const total = results[0].totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNumber);

    if (!adminsWithAvatars.length) {
      return res.status(404).json({ message: "No admin found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Admins retrieved successfully",
      data: adminsWithAvatars,
      pagination: {
        total,
        totalPages,
        currentPage: pageNumber,
        pageSize: limitNumber,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};


// Get Admin Stats
export const getAdminStats = async (req, res) => {
  try {
    const userID = req.user.id;



    // Fetch user package and plan
    const userPackage = await Package.findOne({ userID: userID }).populate('planID');
    if (!userPackage) {
      return res.status(200).send('User package not found');
    }

    const userPlan = userPackage.planID;

    // Calculate total used storage by the user
    const totalUsedStorage = await File.aggregate([
      { $match: { userID: userID } },
      { $group: { _id: null, totalSize: { $sum: "$size" } } }
    ]);

    const usedStorage = totalUsedStorage[0] ? totalUsedStorage[0].totalSize : 0;
    const totalStorage = userPlan.storageLimit;
    const userData = await User.find({adminID: userID});
    const fileData = await File.find({userID: userID});

    res.status(200).json({
      totalStorage: totalStorage,
      usedStorage: usedStorage,
      remainingStorage: totalStorage - usedStorage,
      totalUsers: userData.length,
      totalFiles: fileData.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




