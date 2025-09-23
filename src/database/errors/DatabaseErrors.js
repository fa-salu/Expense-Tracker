export class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = "DatabaseError";
    this.originalError = originalError;
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message, originalError = null) {
    super(message, originalError);
    this.name = "ConnectionError";
  }
}

export class QueryError extends DatabaseError {
  constructor(message, originalError = null) {
    super(message, originalError);
    this.name = "QueryError";
  }
}
