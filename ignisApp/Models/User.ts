// User.ts
import mongoose from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  role: 'operador' | 'major' | 'administrador';
  passwordHash: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['operador', 'major', 'administrador'],
    default: 'operador'
  },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const UserModel = mongoose.model<IUser>('User', UserSchema);

export { UserModel };