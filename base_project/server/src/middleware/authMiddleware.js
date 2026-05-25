function extractBearerToken(authorizationHeader) {
  const value = String(authorizationHeader || "");
  if (!value.startsWith("Bearer ")) {
    return null;
  }
  return value.slice("Bearer ".length).trim();
}

export function createAuthMiddleware({ tokenService }) {
  return {
    authenticate(req, res, next) {
      const token = extractBearerToken(req.headers.authorization);
      if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      try {
        const payload = tokenService.verifyAccessToken(token);
        req.auth = {
          userId: Number(payload.sub),
          username: payload.username,
          role: payload.role
        };
        next();
      } catch (_error) {
        res.status(401).json({ error: "Unauthorized" });
      }
    },

    requireAdmin(req, res, next) {
      if (!req.auth || req.auth.role !== "admin") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      next();
    }
  };
}

