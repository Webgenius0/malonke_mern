// Controller to handle contact form submission
import PackageContact from "../models/packageContactModel.js";
import catchAsync from "../utils/catchAsync.js";
import Notification from "../models/notificationModel.js";
import {emailUtility} from "../utils/emailUtility.js";
import AppError from "../utils/AppError.js";

export const createContactSubmission = catchAsync(async (req, res, next) => {
    const {fullName, email, subject, message, packageName} = req.body;

    const contactData = new PackageContact({
        fullName,
        email,
        subject,
        message,
        packageName,
    });

    await contactData.save();

    // Create a notification for the admin
    const notification = new Notification({
        message: `New contact from ${fullName} regarding the package: ${packageName}`,
        packageContactID: contactData._id
    });

    await notification.save();

    const options = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `${subject}`,
        html: `<html>
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
                  margin: 0 auto;
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
                }
                .content {
                  font-size: 16px;
                  color: #555;
                  line-height: 1.6;
                }
                .important {
                  color: #d9534f;
                  font-weight: bold;
                }
                .link-button {
                  display: inline-block;
                  padding: 12px 20px;
                  background-color: #29ABE2;
                  border-radius: 4px;
                  font-size: 16px;
                  margin-top: 20px;
                }
                
                .link-button:hover {
                background-color: #255A87;
                }
                
                .footer {
                  text-align: center;
                  font-size: 14px;
                  color: #888;
                  margin-top: 20px;
                }
                .footer p {
                  margin: 0;
                  font-weight:500;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${subject}</h1>
                </div>
                <div class="content">
                  <p>Hello there,</p>
                  <p>${fullName}  want to connect with you!</p>
                  <p>${message}</p>
                </div>
              </div>
            </body>
          </html>`,
    };

    await emailUtility(options, next);

    // Respond to the client
    res.status(200).json({message: "Contact form submitted"});
});



export const getAllNotifications = async (req, res, next) => {
    // Fetch all notifications and sort by `isRead` (unread first)
    const data = await Notification.find().sort({ isRead: 1 });

    // If no notifications are found
    if (data.length === 0) {
        return next(new AppError("No notifications found.", 200));
    }

    // Return the notifications
    res.status(200).json({
        status: "success",
        data: data,
    });
}

export const getNotification = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const notification = await Notification.findById(id);
    if (!notification) {
        return next(new AppError("No notification found.", 202));
    }
    const packageContact = await PackageContact.findOne({_id:notification.packageContactID});
    if (!packageContact) {
        return next(new AppError("No package contacts found.", 200));
    }
    res.status(200).json({status: "success", data: {notification, packageContact}});
})


export const markAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
        return next(new AppError("Notification not found.", 200));
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
        status: "success",
        message: "Notification marked as read.",
    });
});