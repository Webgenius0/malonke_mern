import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        designation: {
            type: String,
            required: true,
            trim: true,
        },
        isCEO: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            required: function () {
                return this.isCEO;
            },
            trim: true,
        },
    },
    {timestamps: true, versionKey: false});

const TeamMember = mongoose.model('teams', teamMemberSchema);

export default TeamMember;
