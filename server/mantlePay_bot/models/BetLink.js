import mongoose from 'mongoose';

const betLinkSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true // Discord ID of person creating the bet
    },
    betautolink: {
        type: String,
        required: true,
        unique: true // This will serve as our betId for the smart contract
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now
    },
    question: {
        type: String,
        required: true // The betting question
    },
    amount: {
        type: Number,
        required: true // Bet amount in ETH
    },
    transactionHash: {
        type: String,
        required: false // Will be set when bet is created on contract
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    result: {
        type: Boolean,
        required: false // Will be set when bet is resolved
    },
    yesVoters: [{
        type: String // Discord IDs of users who voted yes
    }],
    noVoters: [{
        type: String // Discord IDs of users who voted no
    }]
});

// Helper method for creating new bet links
betLinkSchema.statics.createNewBetLink = async function(creatorId, sessionId, question, amount) {
    return await this.create({
        creator: creatorId,
        betautolink: sessionId,
        question: question,
        amount: amount
    });
};

export default mongoose.models.BetLink || mongoose.model('BetLink', betLinkSchema);