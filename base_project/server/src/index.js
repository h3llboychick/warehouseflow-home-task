import cors from "cors";
import express from "express";
import { pool, waitForDatabase } from "./db.js";
import * as cycleCountEntity from "./entities/cycleCountEntity.js";
import * as inventoryEntity from "./entities/inventoryEntity.js";
import * as reorderEntity from "./entities/reorderEntity.js";
import * as shipmentEntity from "./entities/shipmentEntity.js";
import * as cycleCountModel from "./models/cycleCountModel.js";
import * as authModel from "./models/authModel.js";
import * as dateModel from "./models/dateModel.js";
import * as inventoryModel from "./models/inventoryModel.js";
import * as reorderModel from "./models/reorderModel.js";
import * as shipmentModel from "./models/shipmentModel.js";
import * as cycleCountRepository from "./repositories/cycleCountRepository.js";
import * as demoResetRepository from "./repositories/demoResetRepository.js";
import * as healthRepository from "./repositories/healthRepository.js";
import * as inventoryRepository from "./repositories/inventoryRepository.js";
import * as reorderRepository from "./repositories/reorderRepository.js";
import * as shipmentRepository from "./repositories/shipmentRepository.js";
import * as userRepository from "./repositories/userRepository.js";
import { registerRoutes } from "./routes/registerRoutes.js";
import { createAuthController } from "./controllers/authController.js";
import { createCycleCountController } from "./controllers/cycleCountController.js";
import { createDemoResetController } from "./controllers/demoResetController.js";
import { createHealthController } from "./controllers/healthController.js";
import { createInventoryController } from "./controllers/inventoryController.js";
import { createReorderController } from "./controllers/reorderController.js";
import { createShipmentController } from "./controllers/shipmentController.js";
import { createUserAdminController } from "./controllers/userAdminController.js";
import * as userEntity from "./entities/userEntity.js";
import { createAuthMiddleware } from "./middleware/authMiddleware.js";
import { createErrorHandler, createRequestLoggingMiddleware } from "./observability/httpLogging.js";
import { logError, logInfo, serializeError } from "./observability/logger.js";
import { createAuthService } from "./services/authService.js";
import { createAuthBootstrapService } from "./services/authBootstrapService.js";
import { createCycleCountService } from "./services/cycleCountService.js";
import { createDemoResetService } from "./services/demoResetService.js";
import { createHealthService } from "./services/healthService.js";
import { createInventoryService } from "./services/inventoryService.js";
import { createPasswordService } from "./services/passwordService.js";
import { createReorderService } from "./services/reorderService.js";
import { createShipmentService } from "./services/shipmentService.js";
import { createTokenService } from "./services/tokenService.js";
import { createUserAdminService } from "./services/userAdminService.js";

const app = express();
const port = Number(process.env.PORT || 3301);

process.on("unhandledRejection", (reason) => {
  logError("process_unhandled_rejection", {
    error: serializeError(reason instanceof Error ? reason : new Error(String(reason)))
  });
});

process.on("uncaughtException", (error) => {
  logError("process_uncaught_exception", { error: serializeError(error) });
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(createRequestLoggingMiddleware());

const healthService = createHealthService({ pool, healthRepository });
const passwordService = createPasswordService();
const tokenService = createTokenService();
const authService = createAuthService({ pool, userRepository, userEntity, passwordService, tokenService });
const authBootstrapService = createAuthBootstrapService({ pool, userRepository, passwordService });
const userAdminService = createUserAdminService({ pool, userRepository, userEntity, passwordService });
const inventoryService = createInventoryService({ pool, inventoryRepository, inventoryEntity });
const shipmentService = createShipmentService({ pool, shipmentRepository, shipmentEntity });
const cycleCountService = createCycleCountService({ pool, cycleCountRepository, cycleCountEntity });
const reorderService = createReorderService({ pool, reorderRepository, reorderEntity });
const demoResetService = createDemoResetService({ pool, demoResetRepository });

const controllers = {
  authController: createAuthController({ authService, authModel }),
  healthController: createHealthController({ healthService }),
  inventoryController: createInventoryController({ inventoryService, inventoryModel }),
  shipmentController: createShipmentController({ shipmentService, shipmentModel, dateModel }),
  cycleCountController: createCycleCountController({ cycleCountService, cycleCountModel }),
  reorderController: createReorderController({ reorderService, reorderModel }),
  demoResetController: createDemoResetController({ demoResetService, dateModel }),
  userAdminController: createUserAdminController({ userAdminService, authModel })
};

const authMiddleware = createAuthMiddleware({ tokenService });

registerRoutes(app, controllers, authMiddleware);
app.use(createErrorHandler());

await waitForDatabase();
await authBootstrapService.ensureDefaults();
app.listen(port, () => {
  logInfo("server_started", { port });
});
