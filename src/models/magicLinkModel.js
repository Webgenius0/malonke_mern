import mongoose from 'mongoose';

const magicLinkSchema = new mongoose.Schema({
        email: {
            type: String,
            required: [true, 'Please enter a valid email'],
            index: true,
            trim: true,
            lowercase: true
        },
        magicLink: {
            type: String,
            required: [true, 'Please enter a magic link'],
            index: true,
            trim: true
        },
        adminID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: [true, 'Please enter admin ID'],
        },
        isUsed: {
            type: Boolean,
            default: false
        },
        expiresAt: {
            type: Date,
            required: true,
            index: {expireAfterSeconds: 0},
        }
    },
    {timestamps: true, versionKey: false});

const MagicLink = mongoose.model('magiclinks', magicLinkSchema);
export default MagicLink;