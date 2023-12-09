import { Router } from 'express';
import { loginHandler } from './login';

const authRoutes = Router()

authRoutes.post('/login', loginHandler)
 


export default authRoutes