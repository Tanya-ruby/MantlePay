import mongoose from 'mongoose';

const placeBetLinkSchema = new mongoose.Schema({
    placer: {
        type: String,
        required: true  // Discord ID of person placing the bet
    },
    placeautolink: {
        type: String,
        required: true,   
    },
    originalbetautolink: {
        type: String,
        required: true  // Reference to original bet's autolink
    },
    choice: {
        type: Boolean,
        required: false  // true for Yes, false for No, will be set when they choose
    },
    transactionHash: {
        type: String,
        required: false  // Will be set when bet is placed on contract
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// Helper method for creating new place bet links
placeBetLinkSchema.statics.createNewPlaceBetLink = async function(
    placer,
    placeautolink,
    originalbetautolink
) {
    return await this.create({
        placer,
        placeautolink,
        originalbetautolink
    });
};

export default mongoose.models.PlaceBetLink || mongoose.model('PlaceBetLink', placeBetLinkSchema);