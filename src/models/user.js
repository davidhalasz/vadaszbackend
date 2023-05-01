const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
      },
      email: {
        type: String,
        require: true,
      },
      password: {
        type: String,
        require: true,
      },
      token: {
        type: String,
        allowNull: true,
      },
      telephone: {
        type: String,
        require: false,
      },
      activated: {
        type: Boolean,
        default: false,
        require: true,
      },
      products: [{type: Schema.Types.ObjectId, ref: "Product"}]
});

module.exports  = mongoose.model("User", userSchema);