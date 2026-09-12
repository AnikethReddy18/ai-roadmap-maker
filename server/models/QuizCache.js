import mongoose from 'mongoose';

const QuizCacheSchema = new mongoose.Schema({
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true,
    unique: true
  },
  questions: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('QuizCache', QuizCacheSchema);
