import DataTable from "../components/common/DataTable.jsx";

const USER_COLUMNS = [
  { key: "username", label: "Username" },
  { key: "role", label: "Role" },
  { key: "is_active", label: "Active", render: (row) => (row.is_active ? "yes" : "no") },
  { key: "created_at", label: "Created at" }
];

export default function AdminUsersPage({
  currentUser,
  newUserUsername,
  newUserPassword,
  newUserRole,
  onNewUserUsernameChange,
  onNewUserPasswordChange,
  onNewUserRoleChange,
  onCreateUser,
  onRefreshUsers,
  adminMessage,
  adminUsers
}) {
  const canManageUsers = currentUser?.role === "admin";

  if (!canManageUsers) {
    return (
      <section className="content-grid">
        <div className="panel">
          <h2>User Administration</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-grid">
      <div className="panel">
        <h2>User Administration</h2>
        <p>Create and manage application users and roles.</p>
        <div className="form-grid">
          <label>
            Username
            <input value={newUserUsername} onChange={(event) => onNewUserUsernameChange(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={newUserPassword} onChange={(event) => onNewUserPasswordChange(event.target.value)} />
          </label>
          <label>
            Role
            <select value={newUserRole} onChange={(event) => onNewUserRoleChange(event.target.value)}>
              <option value="operator">operator</option>
              <option value="admin">admin</option>
            </select>
          </label>
        </div>
        <div className="button-row">
          <button onClick={onCreateUser}>Create User</button>
          <button className="button-secondary" onClick={onRefreshUsers}>Refresh Users</button>
        </div>
        {adminMessage ? <p className="status-note">{adminMessage}</p> : null}
      </div>

      <div className="panel">
        <h3>Users</h3>
        <DataTable
          columns={USER_COLUMNS}
          rows={adminUsers}
          emptyMessage="No users found."
        />
      </div>
    </section>
  );
}
