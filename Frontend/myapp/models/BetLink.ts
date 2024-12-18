import mongoose from 'mongoose';

const betLinkSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true 
    },
    betautolink: {
        type: String,
        required: true,
        unique: true 
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now
    },
    question: {
        type: String,
        required: true 
    },
    amount: {
        type: Number,
        required: true 
    },
    transactionHash: {
        type: String,
        required: false
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    result: {
        type: Boolean,
        required: false 
    },
    yesVoters: [{
        type: String 
    }],
    noVoters: [{
        type: String 
    }]
});

betLinkSchema.statics.createNewBetLink = async function(creatorId, sessionId, question, amount) {
    return await this.create({
        creator: creatorId,
        betautolink: sessionId,
        question: question,
        amount: amount
    });
};

export default mongoose.models.BetLink || mongoose.model('BetLink', betLinkSchema);