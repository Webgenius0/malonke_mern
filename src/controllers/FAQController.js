import FAQ from "../models/FAQModel.js";

// Create FAQ
export const createFAQ = async (req, res) => {
  try {
    // Find the last FAQ
    const lastFAQ = await FAQ.findOne().sort({ serial: -1 });

    // If there's no FAQ yet, start the serial from 1
    const newSerial = lastFAQ ? lastFAQ.serial + 1 : 1;

    const { question, answer } = req.body;

    // Create a new FAQ document
    const newFAQ = new FAQ({ serial: newSerial, question, answer });

    // Save the new FAQ to the database
    await newFAQ.save();

    res.status(201).json({ message: "FAQ created successfully", data: newFAQ });
  } catch (error) {
    res.status(500).json({ message: "Error creating FAQ", error });
  }
};

// Get all FAQs
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ serial: 1 });
    res.status(200).json({ message: "FAQs get successfully", data: faqs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching FAQs", error });
  }
};

// Update FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );
    if (!updatedFAQ) return res.status(404).json({ message: "FAQ not found" });
    res
      .status(200)
      .json({ message: "FAQ updated successfully", data: updatedFAQ });
  } catch (error) {
    res.status(500).json({ message: "Error updating FAQ", error });
  }
};

// Delete FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
    if (!deletedFAQ) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting FAQ", error });
  }
};

