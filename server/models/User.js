import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  geminiApiKey: {
    type: String,
    required: true
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },
  userCategory: {
    type: String,
    default: ''
  },
  curatedKeywords: {
    type: [String],
    default: []
  },
  initialInterests: {
    type: [String],
    default: []
  },
  interestTree: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
