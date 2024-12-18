import mongoose from 'mongoose';

const UserLinkSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  autolink: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '0x'
  },
  generateTIME: {
    type: Date,
    required: true,
  }
});

export default mongoose.models.UserLink || mongoose.model('UserLink', UserLinkSchema);