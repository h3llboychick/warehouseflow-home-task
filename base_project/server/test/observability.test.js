import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { createErrorHandler, createRequestLoggingMiddleware } from "../src/observability/httpLogging.js";
import { registerRoutes } from "../src/routes/registerRoutes.js";

function createAppWithThrowingInventoryRoute() {
  const app = express();
  app.use(express.json());
  app.use(createRequestLoggingMiddleware());

  const notImplemented = (_req, res) => {
    res.status(501).json({ error: "Not implemented in test app" });
  };

  const controllers = {
    authController: { login: notImplemented, me: notImplemented },
    healthController: { getHealth: notImplemented },
    inventoryController: {
      async getInventory() {
        throw new Error("inventory exploded");
      }
    },
    shipmentController: { allocateShipment: notImplemented, getTodayShipments: notImplemented, getAllShipments: notImplemented },
    cycleCountController: { getCycleCounts: notImplemented, approveRecount: notImplemented },
    reorderController: { getGroupedVendorSummary: notImplemented, getLowStockRows: notImplemented },
    demoResetController: { resetDemoState: notImplemented },
    userAdminController: { listUsers: notImplemented, createUser: notImplemented }
  };

  const middleware = {
    authenticate(req, _res, next) {
      req.auth = { userId: 1, username: "test-admin", role: "admin" };
      next();
    },
    requireAdmin(_req, _res, next) {
      next();
    }
  };

  registerRoutes(app, controllers, middleware);
  app.use(createErrorHandler());
  return app;
}

async function startServer(app) {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  };
}

test("async route failures return a 500 JSON response instead of hanging the request", async (t) => {
  const app = createAppWithThrowingInventoryRoute();
  const server = await startServer(app);
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/inventory`, {
    headers: { authorization: "Bearer test-token" }
  });

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "Internal server error" });
});
