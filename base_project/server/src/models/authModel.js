function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseLoginRequest(body) {
  return {
    username: normalizeString(body.username),
    password: typeof body.password === "string" ? body.password : ""
  };
}

export function parseCreateUserRequest(body) {
  return {
    username: normalizeString(body.username),
    password: typeof body.password === "string" ? body.password : "",
    role: normalizeString(body.role).toLowerCase() || "operator"
  };
}

