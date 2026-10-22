import api from "./api.js";

// POST /api/auth/register
export async function registerUser(userData) {
  if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
    throw new Error("Registration data must be a valid object.");
  }

  const { name, email, password } = userData;

  if (typeof name !== "string" || name.trim().length < 2) {
    throw new Error("Name must contain at least 2 characters.");
  }

  if (name.trim().length > 100) {
    throw new Error("Name must be 100 characters or fewer.");
  }

  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Email is required.");
  }

  if (typeof password !== "string" || !password) {
    throw new Error("Password is required.");
  }

  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  if (new TextEncoder().encode(password).length > 72) {
    throw new Error("Password must not exceed 72 UTF-8 bytes.");
  }

  const response = await api.post("/auth/register", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  return response.data;
}

// POST /api/auth/login
export async function loginUser(credentials) {
  if (
    !credentials ||
    typeof credentials !== "object" ||
    Array.isArray(credentials)
  ) {
    throw new Error("Login credentials must be a valid object.");
  }

  const { email, password } = credentials;

  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Email is required.");
  }

  if (typeof password !== "string" || !password) {
    throw new Error("Password is required.");
  }

  const response = await api.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return response.data;
}

// GET /api/auth/me
export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}
