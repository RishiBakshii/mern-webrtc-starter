import mongoose, { Schema } from 'mongoose'

export interface IRoom {
  userId: mongoose.Types.ObjectId
  roomId: string
  roomname: string
}

const roomSchema = new Schema<IRoom>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomname: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { versionKey: false, timestamps: true },
)

export const Room =
  (mongoose.models.Room as mongoose.Model<IRoom>) ??
  mongoose.model<IRoom>('Room', roomSchema)
