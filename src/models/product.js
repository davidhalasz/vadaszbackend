const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  city: {
    type: String,
    require: true,
  },
  county: {
    type: String,
    require: true,
  },
});

const productSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  subCategory: {
    type: String,
    require: false,
  },
  price: {
    type: Number,
    require: true,
  },
  desc: {
    type: String,
    require: true,
  },
  images: [
    {
      type: String,
      require: false,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  featured: {
    type: Boolean,
    require: true,
  },
  place: placeSchema,
  condition: {
    type: String,
    require: true,
  },
  madeYear: {
    type: Number,
    allowNull: true,
  },
  activated: {
    type: Boolean,
    require: true,
    default: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
