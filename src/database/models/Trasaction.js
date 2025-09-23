export class Transaction {
  constructor(data) {
    this.id = data.id?.toString();
    this.user_id = data.user_id;
    this.type = data.type;
    this.amount = parseFloat(data.amount);
    this.description = data.description || "";
    this.category = data.category;
    this.createdAt = data.createdAt || data.created_at;
    this.date = data.createdAt || data.created_at;
  }

  static fromDatabase(row) {
    return new Transaction({
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      amount: row.amount,
      description: row.description,
      category: row.category,
      createdAt: row.created_at,
    });
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      type: this.type,
      amount: this.amount,
      description: this.description,
      category: this.category,
      createdAt: this.createdAt,
      date: this.date,
    };
  }
}
