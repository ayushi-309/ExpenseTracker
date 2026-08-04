const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const protect = require('../middleware/authMiddleware');

// All expense routes are protected
router.use(protect);

// GET /api/expenses - list all expenses for logged in user
router.get('/', getExpenses);
// POST /api/expenses - create a new expense
router.post('/', createExpense);
// GET /api/expenses/:id - get a single expense
router.get('/:id', getExpense);
// PUT /api/expenses/:id - update an expense
router.put('/:id', updateExpense);
// DELETE /api/expenses/:id - delete an expense
router.delete('/:id', deleteExpense);

module.exports = router;
