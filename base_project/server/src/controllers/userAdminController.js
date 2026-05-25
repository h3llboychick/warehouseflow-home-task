export function createUserAdminController({ userAdminService, authModel }) {
  return {
    async listUsers(_req, res) {
      res.json(await userAdminService.listUsers());
    },

    async createUser(req, res) {
      const input = authModel.parseCreateUserRequest(req.body);
      const created = await userAdminService.createUser(input);
      if (!created) {
        res.status(400).json({ error: "Invalid user payload" });
        return;
      }
      if (created.duplicate) {
        res.status(409).json({ error: "Username already exists" });
        return;
      }
      res.status(201).json(created.user);
    }
  };
}

