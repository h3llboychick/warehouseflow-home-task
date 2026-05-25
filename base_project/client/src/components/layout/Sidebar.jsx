export default function Sidebar({
  pages,
  currentUser,
  activePage,
  onPageChange,
  onLogout,
  onResetDemoState,
  resetMessage
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__eyebrow">Operations Platform</span>
        <h1>WarehouseFlow</h1>
        <p>Warehouse operations console</p>
      </div>

      <nav className="nav">
        {pages
          .filter((page) => !page.adminOnly || currentUser.role === "admin")
          .map((page) => (
            <button
              key={page.id}
              className={page.id === activePage ? "nav__item nav__item--active" : "nav__item"}
              onClick={() => onPageChange(page.id)}
            >
              {page.label}
            </button>
          ))}
      </nav>

      <p className="sidebar-user">
        {currentUser.username} ({currentUser.role})
      </p>
      <button className="button-secondary" onClick={onLogout}>Sign Out</button>

      <button className="sidebar__reset" onClick={onResetDemoState}>Restore Operational Data</button>
      {resetMessage ? <p className="status-note">{resetMessage}</p> : null}
    </aside>
  );
}
