import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonProgress {
  lesson: mongoose.Types.ObjectId;
  completedAt: Date;
}

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  payment: mongoose.Types.ObjectId;
  progress: ILessonProgress[];
  completedLessons: number;
  isCompleted: boolean;
  completedAt?: Date;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment reference is required'],
    },
    progress: [
      {
        lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    completedLessons: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    certificateUrl: { type: String },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

export default Enrollment;
