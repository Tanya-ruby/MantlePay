import mongoose from 'mongoose';

const UserLinkSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  autolink: {
    type: String,
    required: true,
    unique: true,  // Added to prevent duplicate session IDs
  },
  address: {
    type: String,
    default: '0x'
  },
  generateTIME: {
    type: Date,
    required: true,
    default: Date.now  // Added for automatic timestamp on creation
  }
});

// Add methods specific to server-side needs
UserLinkSchema.statics.createNewLink = async function(userId, sessionId) {
  return await this.create({
    user: userId,
    autolink: sessionId,
    // generateTIME and address will use defaults
  });
};

export default mongoose.models.UserLink || mongoose.model('UserLink', UserLinkSchema);