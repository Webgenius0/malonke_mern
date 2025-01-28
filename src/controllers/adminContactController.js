import Contact from "../models/userContactModel.js";
import { emailUtility } from "../utils/emailUtility.js";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import AdminContact from "../models/adminContactModel.js";

// Create new contacts
export const createAdminContact = async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req?.body;
        const userID = req?.user?.id;

        const user = await Admin.findOne({_id:userID});
        const superAdminID = user?.superAdminID;

        // Mail option
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
                  <p>${firstName} ${lastName} want to connect with you!</p>
                  <p>${message}</p>
                </div>
              </div>
            </body>
          </html>`,
        };

        // Create a new contact
        const newContact = new AdminContact({
            adminID:userID,
            superAdminID,
            firstName,
            lastName,
            email,
            subject,
            message,
        });

        // Save new contact
        await newContact.save();

        emailUtility(options);

        res.status(201).json({ message: "Contact create successfully", data: newContact });
    } catch (error) {
        res.status(500).json({ message: "Error creating contatc", error });
    }
};

export const getAllAdminContacts = async (req, res) => {
    try {
        const contacts = await AdminContact.find().sort({createdAt: -1 });

        res.status(200).json({ message: "Contacts retrieved successfully!", data: contacts });
    } catch (error) {
        res.status(500).json({ message: "Error fetching contacts", error });
    }
};


// Get a single contact
export const getAdminContact = async (req, res) => {
    try {
        const contact = await AdminContact.findById(req.params.id);
        if (!contact) return res.status(404).json({ message: "Contact not found" });
        res
            .status(200)
            .json({ message: "Contact get successfully!", data: contact });
    } catch (error) {
        res.status(500).json({ message: "Error fatching contact", error });
    }
};

// Delete contact
export const deleteAdminContact = async (req, res) => {
    try {
        const deleteContact = await AdminContact.findByIdAndDelete(req.params.id);
        if (!deleteContact)
            return res.status(404).json({ message: "Contact not found" });
        res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting contact", error });
    }
};
