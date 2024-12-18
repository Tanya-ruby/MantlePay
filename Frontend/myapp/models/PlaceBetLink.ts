import mongoose, { Model } from 'mongoose';



interface IPlaceBetLink extends Document {
  _id: mongoose.Types.ObjectId;
  placer: string;
  placeautolink: string;
  originalbetautolink: string;
  choice?: boolean;
  transactionHash?: string;
  generateTIME: Date;
}


interface PlaceBetLinkModel extends Model<IPlaceBetLink> {
  createNewPlaceBetLink(
    placer: string,
    placeautolink: string,
    originalbetautolink: string
  ): Promise<IPlaceBetLink>;
}

const placeBetLinkSchema = new mongoose.Schema<IPlaceBetLink>({
  placer: {
    type: String,
    required: true 
  },
  placeautolink: {
    type: String,
    required: true,
  },
  originalbetautolink: {
    type: String,
    required: true 
  },
  choice: {
    type: Boolean,
    required: false 
  },
  transactionHash: {
    type: String,
    required: false 
  },
  generateTIME: {
    type: Date,
    required: true,
    default: Date.now
  }
});

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

export default (mongoose.models.PlaceBetLink as PlaceBetLinkModel) || 
  mongoose.model<IPlaceBetLink, PlaceBetLinkModel>('PlaceBetLink', placeBetLinkSchema);