import mongoose from "mongoose";

const vaccinePackageSchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    vaccineId: { type: mongoose.Schema.Types.ObjectId, ref: 'VaccineInventory', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    order: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
});

const VaccinePackage = mongoose.model("VaccinePackage", vaccinePackageSchema);
export default VaccinePackage;