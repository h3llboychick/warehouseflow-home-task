function wrapAsync(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function registerRoutes(app, controllers, middleware) {
  app.post("/api/auth/login", wrapAsync(controllers.authController.login));
  app.get("/api/auth/me", middleware.authenticate, wrapAsync(controllers.authController.me));

  app.get("/api/health", wrapAsync(controllers.healthController.getHealth));

  app.get("/api/inventory", middleware.authenticate, wrapAsync(controllers.inventoryController.getInventory));

  app.post(
    "/api/shipments/:shipmentId/allocate",
    middleware.authenticate,
    wrapAsync(controllers.shipmentController.allocateShipment)
  );
  app.get("/api/shipments/today", middleware.authenticate, wrapAsync(controllers.shipmentController.getTodayShipments));
  app.get("/api/shipments/all", middleware.authenticate, wrapAsync(controllers.shipmentController.getAllShipments));

  app.get("/api/cycle-counts", middleware.authenticate, wrapAsync(controllers.cycleCountController.getCycleCounts));
  app.post(
    "/api/cycle-counts/:id/recount",
    middleware.authenticate,
    wrapAsync(controllers.cycleCountController.approveRecount)
  );

  app.get(
    "/api/reorder-report",
    middleware.authenticate,
    wrapAsync(controllers.reorderController.getGroupedVendorSummary)
  );
  app.get("/api/reorder-low-stock", middleware.authenticate, wrapAsync(controllers.reorderController.getLowStockRows));

  app.post("/api/demo/reset", middleware.authenticate, wrapAsync(controllers.demoResetController.resetDemoState));

  app.get(
    "/api/admin/users",
    middleware.authenticate,
    middleware.requireAdmin,
    wrapAsync(controllers.userAdminController.listUsers)
  );
  app.post(
    "/api/admin/users",
    middleware.authenticate,
    middleware.requireAdmin,
    wrapAsync(controllers.userAdminController.createUser)
  );
}
