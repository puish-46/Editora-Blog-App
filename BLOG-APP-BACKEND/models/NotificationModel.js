import mongoose from "mongoose";

const { Schema, model } = mongoose;

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    type: {
      type: String,
      enum: ["like", "bookmark", "comment", "reply", "follow"],
      required: true
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: "article"
    },
    comment: {
      type: String // We can store comments snippet or comment text as needed
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const NotificationModel = model("notification", NotificationSchema);
