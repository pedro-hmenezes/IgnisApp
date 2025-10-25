import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'IgnisApp API funcionando!' });
});

export { router };