const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPaymentDelay: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
    electricityRate: {
      type: String,
      default: null,
    },
    billingCycleDate: {
      type: String,
      default: null,
    },
    shiftAFrom: { type: String, default: null },
    shiftATo: { type: String, default: null },
    shiftBFrom: { type: String, default: null },
    shiftBTo: { type: String, default: null },
    shiftCFrom: { type: String, default: null },
    shiftCTo: { type: String, default: null },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
