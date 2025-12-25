import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserValidations } from "./vlaidations.ts";
import { validate } from "./middlware.ts";
import { Usermodel } from "./db.ts";
import { successResponse, errorResponse } from "./response.ts";
import { MongoServerError } from "mongodb";
const PORT = 3000;
const SALTING_ROUNDS = 10;
const app = express();
app.use(express.json());

app.post(
  "/api/v1/signup",
  validate(UserValidations.signup),
  async (req: Request, res: Response) => {
    try {
      const { name, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, SALTING_ROUNDS);

      await Usermodel.create({
        username: name,
        password: hashedPassword,
      });

      res
        .status(201)
        .json(successResponse("Signup successful", { username: name }));
    } catch (err: unknown) {
      // Mongo duplicate key error
      if (err instanceof MongoServerError && err.code === 11000) {
        return res
          .status(409)
          .json(errorResponse("User already exists", "DUPLICATE_USER"));
      }

      res
        .status(500)
        .json(errorResponse("Signup failed", "INTERNAL_SERVER_ERROR"));
    }
  }
);

app.post("/api/v1/signin", (req, res) => {});

app.get("/api/v1/content", (req, res) => {});

app.post("/api/v1/space/share", (req, res) => {});

app.get("/api/v1/brain/:sharelink", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});