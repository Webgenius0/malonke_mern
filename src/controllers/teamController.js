import TeamMember from "../models/teamModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// Create a new team member
export const createTeamMember = catchAsync(async (req, res, next) => {
    const { name, image,email,phone, designation, isCEO, description } = req.body;

    // Prevent multiple CEOs
    if (isCEO) {
        const existingCEO = await TeamMember.findOne({ isCEO: true });
        if (existingCEO) {
            return next(new AppError("A CEO already exists.", 400));
        }
    }

    const newTeamMember = new TeamMember({
        name,
        image,
        email,
        phone,
        designation,
        isCEO,
        description: isCEO ? description : undefined,
    });

    await newTeamMember.save();
    res.status(201).json({ message: "Team member created successfully.", data: newTeamMember });
});

// Get all team members with CEO on top
export const getAllTeamMembers = catchAsync(async (req, res, next) => {
    const teamMembers = await TeamMember.find().sort({ isCEO: -1 });

    res.status(200).json({
        message: "Team members retrieved successfully.",
        data: teamMembers
    });
});


// Get a single team member by ID
export const getTeamMemberById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
        return next(new AppError("Team member not found.", 404));
    }

    res.status(200).json({ message: "Team member retrieved successfully.", data: teamMember });
});


// Update a team member
export const updateTeamMember = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, image, email, phone, designation, isCEO, description } = req.body;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
        return next(new AppError("Team member not found.", 404));
    }

    // Prevent multiple CEOs
    if (isCEO && !teamMember.isCEO) {
        const existingCEO = await TeamMember.findOne({ isCEO: true });
        if (existingCEO) {
            return next(new AppError("A CEO already exists.", 400));
        }
    }

    // Conditionally update each field if it's provided, otherwise retain existing value
    teamMember.name = name || teamMember.name;
    teamMember.image = image || teamMember.image;
    teamMember.email = email || teamMember.email;
    teamMember.phone = phone || teamMember.phone;
    teamMember.designation = designation || teamMember.designation;
    teamMember.isCEO = isCEO !== undefined ? isCEO : teamMember.isCEO;

    // Description is only updated if the team member is a CEO
    if (isCEO !== undefined) {
        teamMember.description = isCEO ? description : teamMember.description;
    }

    await teamMember.save();
    res.status(200).json({ message: "Team member updated successfully.", data: teamMember });
});



// Delete a team member
export const deleteTeamMember = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
        return next(new AppError("Team member not found.", 404));
    }

    await teamMember.deleteOne();
    res.status(200).json({ message: "Team member deleted successfully." });
});

// Get only the CEO
export const getCEO = catchAsync(async (req, res, next) => {
    const ceoData = await TeamMember.findOne({ isCEO: true });
    if (!ceoData) {
        return next(new AppError("CEO not found.", 404));
    }
    res.status(200).json({ message: "CEO retrieved successfully.", data: ceoData });
});


// Get all team members except the CEO
export const getTeamWithoutCEO = catchAsync(async (req, res, next) => {
    const teamMembers = await TeamMember.find({ isCEO: false }).sort({ name: 1 });

    if (teamMembers.length === 0) {
        return next(new AppError("No team members found.", 200));
    }

    res.status(200).json({ message: "Team members retrieved successfully.", data: teamMembers });
});
