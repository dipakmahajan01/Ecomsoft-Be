import { Router } from 'express';
import { loginHandler } from './login';
import { logoutHandler } from './logout';

const authRoutes = Router();

authRoutes.post('/login', loginHandler);
authRoutes.post('/logout', logoutHandler);

export default authRoutes;
