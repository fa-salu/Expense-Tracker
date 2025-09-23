export class User {
  constructor(data) {
    this.id = data.id;
    this.phone_number = data.phone_number;
    this.created_at = data.created_at;
  }

  static fromDatabase(row) {
    return new User({
      id: row.id,
      phone_number: row.phone_number,
      created_at: row.created_at,
    });
  }

  toJSON() {
    return {
      id: this.id,
      phone_number: this.phone_number,
      created_at: this.created_at,
    };
  }
}
