export default function LoginPage({
  loginUsername,
  loginPassword,
  onLoginUsernameChange,
  onLoginPasswordChange,
  onLogin,
  authError
}) {
  return (
    <main className="shell shell--single">
      <section className="workspace">
        <div className="panel login-panel">
          <h2>Sign In</h2>
          <p>Enter your credentials to access WarehouseFlow.</p>
          <div className="form-grid">
            <label>
              Username
              <input value={loginUsername} onChange={(event) => onLoginUsernameChange(event.target.value)} />
            </label>
            <label>
              Password
              <input type="password" value={loginPassword} onChange={(event) => onLoginPasswordChange(event.target.value)} />
            </label>
          </div>
          <div className="button-row">
            <button onClick={onLogin}>Sign In</button>
          </div>
          {authError ? <p className="error-note">{authError}</p> : null}
        </div>
      </section>
    </main>
  );
}
