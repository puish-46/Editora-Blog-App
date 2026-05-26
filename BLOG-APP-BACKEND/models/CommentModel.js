import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: "article",
    required: [true, "Article ID is required"]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: [true, "User ID is required"]
  },
  comment: {
    type: String,
    required: [true, "Comment text is required"]
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "comment",
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

export const CommentModel = model("comment", CommentSchema);
