// models/Template.js
const mongoose = require('mongoose');

const ItemObjectSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, trim: true },
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false } // nested item without its own _id
);

const templateSchema = new mongoose.Schema(
  {
    agentCode: { type: String, required: true, trim: true },
    templateName: { type: String, required: true, trim: true },
    // allowed template types: 'template' or 'add on'
    templateType: {
      type: String,
      required: true,
      trim: true,
      enum: ['template', 'add on'],
    },
    // single item (if you used arrays, change accordingly)
    item: { type: ItemObjectSchema, required: true },
    createdBy: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// unique index to avoid duplicate template names per agent
templateSchema.index({ agentCode: 1, templateName: 1 }, { unique: true });

module.exports = mongoose.model('Template', templateSchema);
