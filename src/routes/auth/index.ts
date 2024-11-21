import { Router } from 'express';
import { loginHandler } from './login';
import { logoutHandler } from './logout';
import { authentication } from '../../middleware/authenticate-user';

const authRoutes = Router();

authRoutes.post('/login', loginHandler);
authRoutes.use(authentication);
authRoutes.post('/logout', logoutHandler);

export default authRoutes;
