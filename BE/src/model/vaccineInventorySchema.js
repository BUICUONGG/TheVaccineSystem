import mongoose from "mongoose";

const vaccineInventorySchema = new mongoose.Schema({
  vaccineName: { 
    type: String, 
    required: [true, "Vaccine name is required"],
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  quantity: { 
    type: Number, 
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"]
  },
  mfgDate: { 
    type: String, 
    required: [true, "Manufacturing date is required"]
  },
  expDate: { 
    type: String, 
    required: [true, "Expiration date is required"],
    validate: {
      validator: function(value) {
        return value > this.mfgDate;
      },
      message: "Expiration date must be after manufacturing date"
    }
  },
  status: {
    type: String,
    enum: ["in stock", "out of stock"],
    default: "in stock",
  }
}, { 
  timestamps: true,
  collection: 'vaccineinventories' // Chỉ định rõ tên collection
});

const VaccineInventory = mongoose.model("VaccineInventory", vaccineInventorySchema);

export default VaccineInventory;
