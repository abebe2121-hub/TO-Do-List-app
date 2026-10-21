import api from "./api.js";

// POST /api/auth/register
export async function registerUser(userData) {
  if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
    throw new Error("Registration data must be a valid object.");
  }

  const { name, email, password } = userData;

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Name is required.");
  }

  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Email is required.");
  }

  if (typeof password !== "string" || !password) {
    throw new Error("Password is required.");
  }

  // Do not send confirmPassword or unrelated frontend-only fields.
  const response = await api.post("/auth/register", {
    name: name.trim(),
    email: email.trim(),
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
    email: email.trim(),
    password,
  });

  // The caller handles the returned user and token.
  // Do not store the token here.
  return response.data;
}

// GET /api/auth/me
// Requires a backend endpoint that verifies the bearer token
// and returns the currently authenticated user's profile.
export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}
