import {emailUtility} from "../utils/emailUtility.js";
import catchAsync from "../utils/catchAsync.js";
import Contact from "../models/externalContactModel.js";
import AppError from "../utils/AppError.js";


export const createExternalContact = catchAsync(async (req, res, next) => {
    const {fullName, email, subject, message} = req?.body;

    const options = {
        from: process.env.EMAIL_USER,
        to: "abdussjscript@gmail.com",
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
                  <p>${fullName} wants to connect with you!</p>
                  <p>${message}</p>
                </div>
              </div>
            </body>
          </html>`,
    };

    // Create a new contact
    const newContact = new Contact({
        fullName,
        email,
        subject,
        message,
    });

    // Save new contact to the database
    await newContact.save();

    // Send email using email utility function
    emailUtility(options);

    res.status(201).json({message: "Contact created successfully", data: newContact});
});


export const getAllExternalContacts = catchAsync(async (req, res, next) => {
    const data = await Contact.find().sort({createdAt: -1});
    if (data.length === 0) {
        return next(new AppError("No Contact Found!", 200));
    }
    res.status(200).json({status: "success", data});
})


export const getExternalContactById = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const contact = await Contact.findById(id);
    if (!contact) {
        return next(new AppError('Contact not found', 404));
    }

    res.status(200).json({status: 'success', data: contact});
});


export const deleteExternalContact = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
        return next(new AppError('Contact not found', 404));
    }

    res.status(200).json({status: 'success', message: 'Contact deleted successfully'});
});
