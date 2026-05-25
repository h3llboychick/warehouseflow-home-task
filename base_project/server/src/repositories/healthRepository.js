export async function ping(pool) {
  await pool.query("SELECT 1");
}

