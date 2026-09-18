import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      // If null/undefined, it's a global announcement from admin
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ course: 1, createdAt: -1 });
announcementSchema.index({ isGlobal: 1, createdAt: -1 });

export const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
