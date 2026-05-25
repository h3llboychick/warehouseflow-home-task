export function toUser(row) {
  return {
    id: Number(row.id),
    username: row.username,
    role: row.role,
    is_active: Boolean(row.is_active),
    created_at: row.created_at
  };
}

export function toAuthUser(row) {
  return {
    id: Number(row.id),
    username: row.username,
    password_hash: row.password_hash,
    role: row.role,
    is_active: Boolean(row.is_active)
  };
}

