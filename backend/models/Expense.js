const mongoose = require('mongoose');
const { ExpenseFallback } = require('../config/inMemoryStore');

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: { type: String, required: false },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const MongooseExpense = mongoose.model('Expense', expenseSchema);

const ExpenseProxy = {
  find: (query) => (mongoose.connection.readyState === 1 ? MongooseExpense.find(query) : ExpenseFallback.find(query)),
  create: (data) => (mongoose.connection.readyState === 1 ? MongooseExpense.create(data) : ExpenseFallback.create(data)),
  findOne: (query) => (mongoose.connection.readyState === 1 ? MongooseExpense.findOne(query) : ExpenseFallback.findOne(query)),
  findOneAndUpdate: (query, update, options) => (mongoose.connection.readyState === 1 ? MongooseExpense.findOneAndUpdate(query, update, options) : ExpenseFallback.findOneAndUpdate(query, update, options)),
  findOneAndDelete: (query) => (mongoose.connection.readyState === 1 ? MongooseExpense.findOneAndDelete(query) : ExpenseFallback.findOneAndDelete(query)),
};

module.exports = ExpenseProxy;