const mongoose = require("mongoose");
const { UserFallback } = require("../config/inMemoryStore");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    monthlyBudget: {
      type: Number,
      default: 50000,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseUser = mongoose.model("User", userSchema);

const UserProxy = {
  findOne: (query) => (mongoose.connection.readyState === 1 ? MongooseUser.findOne(query) : UserFallback.findOne(query)),
  create: (data) => (mongoose.connection.readyState === 1 ? MongooseUser.create(data) : UserFallback.create(data)),
  findById: (id) => (mongoose.connection.readyState === 1 ? MongooseUser.findById(id) : UserFallback.findById(id)),
  findByIdAndUpdate: (id, update, options) => (mongoose.connection.readyState === 1 ? MongooseUser.findByIdAndUpdate(id, update, options) : UserFallback.findByIdAndUpdate(id, update, options)),
};

module.exports = UserProxy;
