import mongoose from 'mongoose';

const RoadmapSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  phases: {
    type: mongoose.Schema.Types.Mixed, // Storing unstructured phase/node hierarchy
    required: true
  },
  completedNodes: {
    type: Map,
    of: Boolean,
    default: {}
  },
  isSubRoadmap: {
    type: Boolean,
    default: false
  },
  parentNodeId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Roadmap', RoadmapSchema);
