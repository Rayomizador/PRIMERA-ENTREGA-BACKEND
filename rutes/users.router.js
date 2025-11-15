import { Router } from 'express';
import { userManager } from '../managers/UserManager.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await userManager.getAll();
    const sanitized = users.map(({ password, ...rest }) => rest);
    res.status(200).json(sanitized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await userManager.getById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const updated = await userManager.updateUser(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await userManager.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
