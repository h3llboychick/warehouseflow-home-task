import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import Sidebar from "./components/layout/Sidebar.jsx";
import { pages } from "./constants/navigation.js";
import LoadingPage from "./pages/LoadingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { getJson } from "./lib/apiClient.js";
import { applyRecountResult, summarize } from "./lib/cycleCountState.js";
import { todayInTimezone } from "./lib/date.js";

const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage.jsx"));
const AllocationPage = lazy(() => import("./pages/AllocationPage.jsx"));
const CycleCountsPage = lazy(() => import("./pages/CycleCountsPage.jsx"));
const InventoryPage = lazy(() => import("./pages/InventoryPage.jsx"));
const OverviewPage = lazy(() => import("./pages/OverviewPage.jsx"));
const ReorderPage = lazy(() => import("./pages/ReorderPage.jsx"));
const ShipmentsPage = lazy(() => import("./pages/ShipmentsPage.jsx"));

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const [token, setToken] = useState(() => localStorage.getItem("warehouseflow_token") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [adminUsers, setAdminUsers] = useState([]);
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("operator");
  const [adminMessage, setAdminMessage] = useState("");
  const [inventory, setInventory] = useState([]);
  const [inventorySku, setInventorySku] = useState("");
  const [inventoryAisle, setInventoryAisle] = useState("");
  const [allocationInventory, setAllocationInventory] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [allShipments, setAllShipments] = useState([]);
  const [allocationResult, setAllocationResult] = useState([]);
  const [cycleState, setCycleState] = useState({ rows: [], totals: { openReviewCount: 0, totalRows: 0 } });
  const [reorderReport, setReorderReport] = useState([]);
  const [lowStockRows, setLowStockRows] = useState([]);
  const [lowStockTotal, setLowStockTotal] = useState(0);
  const [groupedPage, setGroupedPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [groupedPageSize] = useState(10);
  const [lowStockPageSize] = useState(10);
  const [resetMessage, setResetMessage] = useState("");
  const shipmentDate = useMemo(() => todayInTimezone("Europe/Tallinn"), []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        if (!cancelled) {
          setCurrentUser(null);
          setAuthChecking(false);
        }
        return;
      }

      try {
        const me = await getJson("/api/auth/me", {}, token);
        if (cancelled) {
          return;
        }
        setCurrentUser(me);
        setAuthError("");
        await Promise.all([
          refreshInventory({ includeBlankAisle: false }),
          refreshAllocationInventory(),
          refreshShipments(),
          refreshCycleCounts(),
          refreshReorderReport()
        ]);
        if (me.role === "admin") {
          await refreshAdminUsers();
        }
      } catch (error) {
        if (!cancelled) {
          setToken("");
          setCurrentUser(null);
          localStorage.removeItem("warehouseflow_token");
          setAuthError(error.message || "Authentication failed");
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (activePage === "admin-users" && currentUser && currentUser.role !== "admin") {
      setActivePage("overview");
    }
  }, [activePage, currentUser]);

  async function refreshInventory({ includeBlankAisle = true, sku = inventorySku, aisle = inventoryAisle } = {}) {
    const params = new URLSearchParams();
    if (sku) {
      params.set("sku", sku);
    }
    if (aisle || (includeBlankAisle && aisle === "")) {
      params.set("aisle", aisle);
    }
    const query = params.toString();
    const rows = await getJson(`/api/inventory${query ? `?${query}` : ""}`, {}, token);
    setInventory(rows);
  }

  async function refreshAllocationInventory() {
    const rows = await getJson("/api/inventory?sku=SKU-100", {}, token);
    setAllocationInventory(rows);
  }

  async function refreshShipments() {
    const rows = await getJson(`/api/shipments/today?targetDate=${shipmentDate}&timezone=Europe/Tallinn`, {}, token);
    setShipments(rows);
    const allRows = await getJson("/api/shipments/all", {}, token);
    setAllShipments(allRows);
  }

  async function runAllocation() {
    const response = await getJson("/api/shipments/1/allocate", { method: "POST", body: JSON.stringify({}) }, token);
    setAllocationResult(response.allocations);
    await refreshAllocationInventory();
  }

  async function refreshCycleCounts() {
    const rows = await getJson("/api/cycle-counts", {}, token);
    setCycleState({ rows, totals: summarize(rows) });
  }

  async function applyRecount() {
    const updated = await getJson(
      "/api/cycle-counts/2/recount",
      {
        method: "POST",
        body: JSON.stringify({ countedQuantity: 4 })
      },
      token
    );
    setCycleState((current) => applyRecountResult(current.rows, updated));
  }

  async function refreshGroupedReport(page = groupedPage) {
    const safePage = Math.max(1, page);
    const groupedRows = await getJson(`/api/reorder-report?page=${safePage}&pageSize=${groupedPageSize}`, {}, token);
    setReorderReport(groupedRows);
    setGroupedPage(safePage);
  }

  async function refreshLowStockRows(page = lowStockPage) {
    const safePage = Math.max(1, page);
    const lowStockResponse = await getJson(`/api/reorder-low-stock?page=${safePage}&pageSize=${lowStockPageSize}`, {}, token);
    setLowStockRows(lowStockResponse.rows || []);
    setLowStockTotal(lowStockResponse.totalRows || 0);
    setLowStockPage(safePage);
  }

  async function refreshReorderReport() {
    await Promise.all([refreshGroupedReport(groupedPage), refreshLowStockRows(lowStockPage)]);
  }

  async function resetDemoState() {
    await getJson("/api/demo/reset", { method: "POST", body: JSON.stringify({}) }, token);
    setResetMessage("Operational data restored.");
    setAllocationResult([]);
    setGroupedPage(1);
    setLowStockPage(1);
    await refreshInventory();
    await refreshAllocationInventory();
    await refreshShipments();
    await refreshCycleCounts();
    await Promise.all([refreshGroupedReport(1), refreshLowStockRows(1)]);
  }

  async function refreshAdminUsers() {
    const rows = await getJson("/api/admin/users", {}, token);
    setAdminUsers(rows);
  }

  async function login() {
    try {
      const session = await getJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      localStorage.setItem("warehouseflow_token", session.accessToken);
      setToken(session.accessToken);
      setCurrentUser(session.user);
      setAuthError("");
    } catch (error) {
      setAuthError(error.message || "Login failed");
    }
  }

  function logout() {
    localStorage.removeItem("warehouseflow_token");
    setToken("");
    setCurrentUser(null);
    setAdminUsers([]);
    setAuthError("");
    setActivePage("overview");
  }

  async function createUser() {
    try {
      const created = await getJson(
        "/api/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            username: newUserUsername,
            password: newUserPassword,
            role: newUserRole
          })
        },
        token
      );
      setAdminUsers((rows) => [...rows, created].sort((left, right) => left.username.localeCompare(right.username)));
      setNewUserUsername("");
      setNewUserPassword("");
      setNewUserRole("operator");
      setAdminMessage("User created.");
    } catch (error) {
      setAdminMessage(error.message || "Unable to create user");
    }
  }

  function clearInventoryFilters() {
    setInventorySku("");
    setInventoryAisle("");
    refreshInventory({ includeBlankAisle: false, sku: "", aisle: "" });
  }

  const allocationRows = useMemo(
    () =>
      allocationInventory.map((row) => ({
        ...row,
        free_to_allocate: row.on_hand_quantity - row.reserved_quantity
      })),
    [allocationInventory]
  );

  function renderPage() {
    switch (activePage) {
      case "inventory":
        return (
          <InventoryPage
            inventorySku={inventorySku}
            inventoryAisle={inventoryAisle}
            onInventorySkuChange={setInventorySku}
            onInventoryAisleChange={setInventoryAisle}
            onSearchInventory={() => refreshInventory({ includeBlankAisle: true })}
            onClearFilters={clearInventoryFilters}
            onResetDemoState={resetDemoState}
            inventory={inventory}
          />
        );
      case "shipments":
        return (
          <ShipmentsPage
            shipmentDate={shipmentDate}
            onRefreshShipments={refreshShipments}
            onResetDemoState={resetDemoState}
            allShipments={allShipments}
            shipments={shipments}
          />
        );
      case "allocation":
        return (
          <AllocationPage
            onRefreshAllocationInventory={refreshAllocationInventory}
            onRunAllocation={runAllocation}
            onResetDemoState={resetDemoState}
            allocationRows={allocationRows}
            allocationResult={allocationResult}
          />
        );
      case "cycle-counts":
        return (
          <CycleCountsPage
            cycleState={cycleState}
            onApplyRecount={applyRecount}
            onResetDemoState={resetDemoState}
          />
        );
      case "reorder": {
        const lowStockTotalPages = Math.max(1, Math.ceil(lowStockTotal / lowStockPageSize));
        const lowStockPageStart = lowStockTotal === 0 ? 0 : (lowStockPage - 1) * lowStockPageSize + 1;
        const lowStockPageEnd = lowStockTotal === 0 ? 0 : Math.min(lowStockPage * lowStockPageSize, lowStockTotal);
        const lowStockHasNextPage = lowStockPage < lowStockTotalPages;
        const hasGroupedRows = reorderReport.length > 0;

        return (
          <ReorderPage
            reorderReport={reorderReport}
            groupedPage={groupedPage}
            hasGroupedRows={hasGroupedRows}
            onPrevGroupedPage={() => refreshGroupedReport(Math.max(1, groupedPage - 1))}
            onNextGroupedPage={() => refreshGroupedReport(groupedPage + 1)}
            lowStockRows={lowStockRows}
            lowStockTotal={lowStockTotal}
            lowStockPage={lowStockPage}
            lowStockPageStart={lowStockPageStart}
            lowStockPageEnd={lowStockPageEnd}
            lowStockHasNextPage={lowStockHasNextPage}
            onPrevLowStockPage={() => refreshLowStockRows(Math.max(1, lowStockPage - 1))}
            onNextLowStockPage={() => refreshLowStockRows(lowStockPage + 1)}
            onRefreshReport={refreshReorderReport}
            onResetDemoState={resetDemoState}
          />
        );
      }
      case "admin-users":
        return (
          <AdminUsersPage
            currentUser={currentUser}
            newUserUsername={newUserUsername}
            newUserPassword={newUserPassword}
            newUserRole={newUserRole}
            onNewUserUsernameChange={setNewUserUsername}
            onNewUserPasswordChange={setNewUserPassword}
            onNewUserRoleChange={setNewUserRole}
            onCreateUser={createUser}
            onRefreshUsers={refreshAdminUsers}
            adminMessage={adminMessage}
            adminUsers={adminUsers}
          />
        );
      default:
        return (
          <OverviewPage
            shipmentsCount={shipments.length}
            allShipmentsCount={allShipments.length}
            openReviewCount={cycleState.totals.openReviewCount}
            lowStockCount={lowStockTotal}
            activePage={activePage}
          />
        );
    }
  }

  if (authChecking) {
    return <LoadingPage />;
  }

  if (!token || !currentUser) {
    return (
      <LoginPage
        loginUsername={loginUsername}
        loginPassword={loginPassword}
        onLoginUsernameChange={setLoginUsername}
        onLoginPasswordChange={setLoginPassword}
        onLogin={login}
        authError={authError}
      />
    );
  }

  return (
    <main className="shell">
      <Sidebar
        pages={pages}
        currentUser={currentUser}
        activePage={activePage}
        onPageChange={setActivePage}
        onLogout={logout}
        onResetDemoState={resetDemoState}
        resetMessage={resetMessage}
      />
      <section className="workspace">
        <Suspense fallback={<LoadingPage />}>{renderPage()}</Suspense>
      </section>
    </main>
  );
}
