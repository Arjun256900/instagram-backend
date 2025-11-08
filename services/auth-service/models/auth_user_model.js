export class AuthUser {
  constructor({ uid, email, username, createdAt }) {
    this.uid = uid;
    this.email = email;
    this.username = username;
    this.createdAt = createdAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      username: this.username,
      createdAt: this.createdAt,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new AuthUser({
      uid: doc.id,
      email: data.email,
      username: data.username,
      createdAt: data.createdAt,
    });
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validation
  static validate(data) {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push("Valid email is required");
    }

    if (!data.password || data.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }

    if (!data.username || data.username.length < 3) {
      errors.push("Username must be at least 3 characters");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default AuthUser;
