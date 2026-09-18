import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false'],
      default: 'multiple_choice',
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctAnswer: {
      type: Number, // Index of correct option (0, 1, 2, 3)
      required: [true, 'Correct answer index is required'],
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
    explanation: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ quiz: 1 });

export const Question = mongoose.model('Question', questionSchema);
export default Question;
