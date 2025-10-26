import { ILog } from '../Models/Log';

export interface IUserLog extends ILog {
  user: string; 
}