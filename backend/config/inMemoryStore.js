const crypto = require('crypto');

const memoryUsers = [];
const memoryExpenses = [];

class UserFallback {
  static async findOne(query) {
    if (query.email) {
      const found = memoryUsers.find(u => u.email.toLowerCase() === query.email.toLowerCase());
      return found ? { ...found } : null;
    }
    return null;
  }

  static async create(data) {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const user = {
      _id: id,
      id: id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      monthlyBudget: data.monthlyBudget || 50000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.push(user);
    return { ...user };
  }

  static findById(id) {
    const found = memoryUsers.find(u => u._id === id || u.id === id);
    const result = found ? { ...found } : null;
    return {
      select: (fields) => {
        if (!result) return Promise.resolve(null);
        const copy = { ...result };
        if (fields && fields.includes('-password')) {
          delete copy.password;
        }
        return Promise.resolve(copy);
      },
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
  }

  static async findByIdAndUpdate(id, updateData, options) {
    const idx = memoryUsers.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return null;
    if (updateData.$set) updateData = updateData.$set;
    memoryUsers[idx] = {
      ...memoryUsers[idx],
      ...updateData,
      updatedAt: new Date(),
    };
    const copy = { ...memoryUsers[idx] };
    delete copy.password;
    return copy;
  }
}

class ExpenseFallback {
  static find(query) {
    let list = memoryExpenses.filter(e => String(e.user) === String(query.user));
    return {
      sort: (sortObj) => {
        if (sortObj && sortObj.date === -1) {
          list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        return Promise.resolve(list);
      },
      then: (resolve, reject) => Promise.resolve(list).then(resolve, reject),
    };
  }

  static async create(data) {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const expense = {
      _id: id,
      id: id,
      user: data.user,
      title: data.title,
      amount: Number(data.amount),
      category: data.category || 'Other',
      description: data.description,
      date: data.date ? new Date(data.date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryExpenses.push(expense);
    return { ...expense };
  }

  static async findOne(query) {
    const found = memoryExpenses.find(e => e._id === query._id && String(e.user) === String(query.user));
    return found ? { ...found } : null;
  }

  static async findOneAndUpdate(query, updateData, options) {
    const idx = memoryExpenses.findIndex(e => e._id === query._id && String(e.user) === String(query.user));
    if (idx === -1) return null;
    memoryExpenses[idx] = {
      ...memoryExpenses[idx],
      ...updateData,
      updatedAt: new Date(),
    };
    return { ...memoryExpenses[idx] };
  }

  static async findOneAndDelete(query) {
    const idx = memoryExpenses.findIndex(e => e._id === query._id && String(e.user) === String(query.user));
    if (idx === -1) return null;
    const removed = memoryExpenses.splice(idx, 1)[0];
    return { ...removed };
  }
}

module.exports = { UserFallback, ExpenseFallback };
