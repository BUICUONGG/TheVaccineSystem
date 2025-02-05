import mongoose from "mongoose";

const typeSchema = new mongoose.Schema({
  typeName: { type: String, required: true },
});
const Type = mongoose.model("Type", typeSchema);

export default Type;
