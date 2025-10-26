import mongoose from 'mongoose';
import { IUser } from '../Interfaces/UserInterface';


const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['operador', 'major', 'administrador'],
    required: true,
    default: 'operador'
  },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const UserModel = mongoose.model<IUser>('User', UserSchema);
export { UserModel };
export { IUser } from '../Interfaces/UserInterface';
