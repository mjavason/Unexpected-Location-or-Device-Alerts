import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { setupSwagger } from './swagger.config';

//#region App Setup
const app = express();

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const users: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userAgent: string;
  disabled: boolean;
}[] = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
setupSwagger(app, BASE_URL);

//#endregion App Setup

//#region Code here
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: testerZero@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
app.post('/register', (req: Request, res: Response) => {
  const {
    firstName = 'John',
    lastName = 'Doe',
    email,
    password,
    userAgent = undefined,
  } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: 'email and password are required',
    });
  }

  const isDuplicate = users.find((u) => u.email === email.trim().toLowerCase());
  if (isDuplicate)
    return res.status(401).json({ message: 'Email already exists' });

  users.push({
    firstName,
    lastName,
    email: email.trim().toLowerCase(),
    password: password.trim(),
    userAgent,
    disabled: false,
  });
  return res.status(200).json({
    message: 'User registered successfully',
    data: { firstName, lastName, email: email.trim().toLowerCase(), userAgent },
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: testerzero@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
app.post('/login', (req: Request, res: Response) => {
  const { email, password, userAgent } = req.body;
  const user = users.find(
    (u) =>
      u.email === email.trim().toLowerCase() &&
      u.password === password.trim() &&
      u.disabled === false
  );
  if (!user)
    return res.status(401).json({ message: 'Invalid email or password' });

  if (user.userAgent !== userAgent) {
    console.log(
      `User agent mismatch. previous: ${user.userAgent}. current: ${userAgent}`
    );
    const userIndex = users.findIndex(
      (u) => u.email === email.trim().toLowerCase()
    );
    users[userIndex].userAgent = userAgent;
  }

  return res.status(200).json({
    message: 'User logged in successfully',
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userAgent: user.userAgent,
    },
  });
});

/**
 * @swagger
 * /disable/{email}:
 *   get:
 *     summary: Disable a user account
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           example: testerzero@gmail.com
 *     responses:
 *       200:
 *         description: User account disabled successfully
 *       401:
 *         description: Invalid email address
 */
app.get('/disable/:email', (req: Request, res: Response) => {
  const { email } = req.params;

  const userIndex = users.findIndex(
    (u) => u.email === email.trim().toLowerCase()
  );
  if (userIndex < 0)
    return res.status(401).json({ message: 'Invalid email address' });

  users[userIndex].disabled = true;
  return res.send('User account disabled successfully');
});

/**
 * @swagger
 * /do-stuff/{email}:
 *   post:
 *     summary: Perform an action for a user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           example: testerzero@gmail.com
 *     responses:
 *       200:
 *         description: Action performed successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Doing some stuff
 *       401:
 *         description: Invalid email address
 *       403:
 *         description: User account is disabled
 */
app.post('/do-stuff/:email', (req: Request, res: Response) => {
  const { email } = req.params;

  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid email address' });

  if (user.disabled) return res.send('User account disabled');

  return res.send('Doing some stuff');
});

//#endregion

//#region Server Setup

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Call a demo external API (httpbin.org)
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/api', async (req: Request, res: Response) => {
  try {
    const result = await axios.get('https://httpbin.org');
    return res.send({
      message: 'Demo API called (httpbin.org)',
      data: result.status,
    });
  } catch (error: any) {
    console.error('Error calling external API:', error.message);
    return res.status(500).send({ error: 'Failed to call external API' });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health check
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/', (req: Request, res: Response) => {
  return res.send({ message: 'API is Live!' });
});

/**
 * @swagger
 * /obviously/this/route/cant/exist:
 *   get:
 *     summary: API 404 Response
 *     description: Returns a non-crashing result when you try to run a route that doesn't exist
 *     tags: [Default]
 *     responses:
 *       '404':
 *         description: Route not found
 */
app.use((req: Request, res: Response) => {
  return res
    .status(404)
    .json({ success: false, message: 'API route does not exist' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // throw Error('This is a sample error');

  console.log(`${'\x1b[31m'}${err.message}${'\x1b][0m]'} `);
  return res
    .status(500)
    .send({ success: false, status: 500, message: err.message });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

// (for render services) Keep the API awake by pinging it periodically
// setInterval(pingSelf(BASE_URL), 600000);

//#endregion
