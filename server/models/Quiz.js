import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    timeLimit: {
      type: Number, // in minutes (0 means no limit)
      default: 15,
    },
    passingScore: {
      type: Number, // in percentage (e.g. 70)
      default: 70,
    },
    attemptsAllowed: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quiz',
});

quizSchema.index({ course: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
