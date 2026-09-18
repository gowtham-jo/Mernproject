import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module reference is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['video', 'document', 'text', 'quiz'],
      default: 'video',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    documentUrl: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '', // For rich text content or markdown
    },
    duration: {
      type: String,
      default: '10 min',
    },
    order: {
      type: Number,
      default: 0,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ course: 1 });

export const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
