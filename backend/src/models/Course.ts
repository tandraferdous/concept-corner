import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  instructor: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  price: number;
  discountedPrice?: number;
  thumbnail?: string;
  previewVideo?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  duration: number;
  totalLessons: number;
  totalEnrollments: number;
  rating: number;
  totalRatings: number;
  isPublished: boolean;
  isFeatured: boolean;
  requirements: string[];
  learningOutcomes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price cannot be negative'],
    },
    thumbnail: { type: String },
    previewVideo: { type: String },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Level is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English',
    },
    duration: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    totalEnrollments: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    requirements: [{ type: String }],
    learningOutcomes: [{ type: String }],
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1, isFeatured: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
