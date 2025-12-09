import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../Interfaces/UserInterface.js';

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'bombeiro'],
      default: 'user',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser & Document>('User', UserSchema);