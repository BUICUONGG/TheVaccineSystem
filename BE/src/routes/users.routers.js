import { Router } from "express";
import {
  showInFoController,
  addUserController,
} from "../controllers/users.controllers.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and login
 */

const usersRouter = Router();

/**
 * @swagger
 * /user/showInfo:
 *   get:
 *     summary: Show user information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
usersRouter.get("/showInfo", showInFoController);

/**
 * @swagger
 * /user/addUser:
 *   post:
 *     summary: Add a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: User added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
usersRouter.post("/addUser", addUserController);

export default usersRouter;
