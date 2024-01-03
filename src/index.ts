/* eslint-disable no-console */
import * as bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express'; // NextFunction,
import http from 'http';
// import helmet from 'helmet';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
// import { Server } from 'socket.io';
import logger from './lib/logger';
import { logInfo, responseValidation } from './lib';
import authRoutes from './routes/auth';
import sellerRoute from './routes/sellers';
import marketPlaceRoutes from './routes/marketplace';
import rateCardRoutes from './routes/rate_card';
import { todaysOrders } from './helpers/cron-helper/flipkart.cron';

dotenv.config();

const app = express();

const server = new http.Server(app);
app.use(cors());
// const io = new Server(server,{cors: {origin: "*"}});
// app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1tb' }));
app.use((req, res, next) => {
  try {
    // set header for swagger.
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self';",
    );

    // end
    const xForwardedFor = ((req.headers['x-forwarded-for'] || '') as string).replace(/:\d+$/, '');
    const ip = xForwardedFor || req.connection.remoteAddress?.split(':').pop();
    logger.info(
      `------------ API Info ------------
      IMP - API called path: ${req.path},
      method: ${req.method},
      query: ${JSON.stringify(req.query)}, 
      remote address (main/proxy ip):${ip},
      reference: ${req.headers.referer} , 
      user-agent: ${req.headers['user-agent']}
      ------------ End ------------  `,
    );
  } catch (error) {
    logger.error(`error while printing caller info path: ${req.path}`);
  }

  next();
});

const health = (req: Request, res: Response) => {
  res.json({
    message: 'ecomsoft server is working',
    env: process.env.NODE_ENV,
    headers: req.headers,
  });
};

app.get('/', health);

// Swagger for health API
/**
 * @swagger
 * definitions:
 *   health:
 *     example:
 *       data:
 *         message: string
 *         env: string
 *         headers: object
 */

/**
 * @swagger
 *  tags:
 *    name: Default
 *    description: Health Document
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health
 *     tags: [Default]
 *     security: {}
 *     responses:
 *       200:
 *         description: Health.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/health'
 *       500:
 *         description: Something went wrong, please try again later.
 */
app.get('/api/health', health);
// Swagger for login API
/**
 * @swagger
 * components:
 *   schemas:
 *     login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: email
 *         password:
 *           type: string
 *           description: password
 *       example:
 *         email: string
 *         password: string
 *
 */

/**
 * @swagger
 * definitions:
 *   loginInResponse:
 *     example:
 *       data:
 *         user_id: string
 *         first_name: string
 *         email: string
 *         role: string
 *       status_code: 200
 *       status_message: string
 *       response_error: false
 *       token: string
 *       refreshToken: string
 */

/**
 * @swagger
 * definitions:
 *   ErrorResponse:
 *     properties:
 *       message:
 *         type: string
 *       errors:
 *         type: array
 */

/**
 * @swagger
 *  tags:
 *    name: Auth
 *    description: Auth Document
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/login'
 *     security: {}
 *     responses:
 *       200:
 *         description: The login was successfully response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/loginInResponse'
 *       500:
 *         description: Something went wrong, please try again later.
 */
app.use('/api/auth/', authRoutes);
app.use('/api/marketplace', marketPlaceRoutes);
app.use('/api/rate-card', rateCardRoutes);
app.use('/api/seller', sellerRoute);
app.use((req: Request, res: Response) => {
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(responseValidation(StatusCodes.INTERNAL_SERVER_ERROR, 'No route found'));
});

app.use((error: any, req: Request, res: Response) => {
  // , next: NextFunction
  logInfo('app error----------------->', error.message);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
    responseValidation(
      StatusCodes.INTERNAL_SERVER_ERROR,
      /* If the environment is development, then return the error message, otherwise return an empty
        object. */
      process.env.NODE_ENV === 'development' ? error.message : {},
    ),
  );
});

process.on('unhandledRejection', function (reason, promise) {
  logger.error('Unhandled rejection', { reason, promise });
});

// cron set up
// Need to check the value bsc env is returning string.
if (process.env.IS_JOB === 'true') {
  // orderApiCron();
  todaysOrders();
  // cancelOrderApiCron();
  // serverDayOrdersStatusUpdate();
}

// set socket connection
// socketConnection(io);

export default server;
