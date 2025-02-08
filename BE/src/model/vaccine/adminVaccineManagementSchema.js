import mongoose from "mongoose";

const adminVaccineManagementSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    vaccineId: { type: mongoose.Schema.Types.ObjectId, ref: 'VaccineInventory', required: true },
    permissions: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete']
    }],
    createdAt: { type: Date, default: Date.now }
});

const AdminVaccineManagement = mongoose.model("AdminVaccineManagement", adminVaccineManagementSchema);

// export default adminVaccineManagementSchema;
export default AdminVaccineManagement;
