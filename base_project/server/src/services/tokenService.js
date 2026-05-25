import jwt from "jsonwebtoken";

export function createTokenService() {
  const secret = process.env.JWT_SECRET || "warehouseflow-local-secret-change-me";
  const issuer = "warehouseflow-base";
  const audience = "warehouseflow-ui";

  return {
    signAccessToken(user) {
      return jwt.sign(
        {
          sub: String(user.id),
          username: user.username,
          role: user.role
        },
        secret,
        { expiresIn: "8h", issuer, audience }
      );
    },

    verifyAccessToken(token) {
      return jwt.verify(token, secret, { issuer, audience });
    }
  };
}

