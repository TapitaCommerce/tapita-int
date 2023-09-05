import mongoose from "mongoose";
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  paths: {
    type: String,
    unique: true,
  },
});

export default mongoose.model("Image", imageSchema);
