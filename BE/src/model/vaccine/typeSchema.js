import mongoose from "mongoose";

const typeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: { type: Date, default: Date.now }
});

const Type = mongoose.model("Type", typeSchema);
export default Type; 