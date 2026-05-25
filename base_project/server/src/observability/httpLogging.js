import { logError, logInfo, serializeError } from "./logger.js";

function durationMs(startTime) {
  return Number(process.hrtime.bigint() - startTime) / 1e6;
}

function getRequestId(req) {
  const value = req.headers["x-request-id"];
  return typeof value === "string" ? value : undefined;
}

export function createRequestLoggingMiddleware() {
  return function requestLoggingMiddleware(req, res, next) {
    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
      if (req.path === "/api/health" && res.statusCode < 500) {
        return;
      }

      logInfo("http_request_completed", {
        method: req.method,
        path: req.originalUrl,
        status_code: res.statusCode,
        duration_ms: Number(durationMs(startedAt).toFixed(2)),
        request_id: getRequestId(req),
        username: req.auth?.username
      });
    });

    next();
  };
}

export function createErrorHandler() {
  return function errorHandler(error, req, res, next) {
    const statusCode = Number(error?.statusCode) || 500;

    logError("http_request_failed", {
      method: req.method,
      path: req.originalUrl,
      status_code: statusCode,
      request_id: getRequestId(req),
      username: req.auth?.username,
      error: serializeError(error)
    });

    if (res.headersSent) {
      next(error);
      return;
    }

    if (statusCode >= 500) {
      res.status(statusCode).json({ error: "Internal server error" });
      return;
    }

    res.status(statusCode).json({ error: error.message });
  };
}
