import mongoose, { Document, Schema } from 'mongoose';

export interface IResource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'file' | 'code';
}

export interface ILesson extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  videoUrl?: string;
  hlsUrl?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  resources: IResource[];
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: { type: String },
    videoUrl: { type: String },
    hlsUrl: { type: String },
    duration: { type: Number, default: 0 },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
      min: 0,
    },
    isPreview: { type: Boolean, default: false },
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['pdf', 'link', 'file', 'code'],
          default: 'link',
        },
      },
    ],
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;
