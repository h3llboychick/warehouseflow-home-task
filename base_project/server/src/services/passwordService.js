import crypto from "crypto";

function splitHash(passwordHash) {
  const [algorithm, salt, digest] = String(passwordHash || "").split("$");
  return { algorithm, salt, digest };
}

export function createPasswordService() {
  return {
    hashPassword(plainText) {
      const salt = crypto.randomBytes(12).toString("hex");
      const digest = crypto.scryptSync(plainText, salt, 64).toString("hex");
      return `scrypt$${salt}$${digest}`;
    },

    verifyPassword(plainText, passwordHash) {
      const { algorithm, salt, digest } = splitHash(passwordHash);
      if (algorithm !== "scrypt" || !salt || !digest) {
        return false;
      }
      const computed = crypto.scryptSync(plainText, salt, 64).toString("hex");
      return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(digest, "hex"));
    }
  };
}

