import mongoose from 'mongoose';

const rewardLinkSchema = new mongoose.Schema({
    rewarder: {
        type: String,
        required: true  // Discord ID of person sending reward
    },
    recipient: {
        type: String,
        required: true  // Discord ID of recipient
    },
    rewardautolink: {
        type: String,
        required: true,
        unique: true  // Unique session ID for reward creation
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true  // Amount is now set when command is issued
    },
    transactionHash: {
        type: String,
        required: false  // Will be set when reward is sent to contract
    },
    claimed: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        required: true  // Message from rewarder
    }
});

// Helper method for creating new reward links
rewardLinkSchema.statics.createNewRewardLink = async function(rewarderId, recipientId, sessionId) {
    return await this.create({
        rewarder: rewarderId,
        recipient: recipientId,
        rewardautolink: sessionId
    });
};

export default mongoose.models.RewardLink || mongoose.model('RewardLink', rewardLinkSchema);