import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserValidations } from "./vlaidations.ts";
import { authLimiter, validate } from "./middlwares.ts";
import { Usermodel } from "./db.ts";
import { successResponse, errorResponse } from "./response.ts";
import { MongoServerError } from "mongodb";

const JWT_PASS = process.env.JWT_PASSWORD || "";
const PORT = 3000;
const SALTING_ROUNDS = 10;

if (!process.env.JWT_PASSWORD) {
  throw new Error("JWT_PASSWORD environment variable is not set");
}

const app = express();
app.use(express.json());
app.set("trust proxy", 1);


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

app.post("/api/v1/signin", authLimiter , async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json(
          errorResponse("Validation Error", "Username and Password required" )
        );
    }

    const existingUser = await Usermodel.findOne({ username });
    if (!existingUser) {
      return res
        .status(401)
        .json(errorResponse("Signing failed", "Username doesn't exists"));
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(errorResponse("Authentication Failed", "Invalid Passowrd"));
    }

    const token = jwt.sign({ id: existingUser._id }, JWT_PASS, {
      expiresIn: "7d",
    });

    return res.status(200).json(
      successResponse("Signing Successful", {
        jwt_token: token,
        user_id: existingUser._id,
        username: existingUser.username,
      })
    );
  } catch (err) {
    return res
      .status(500)
      .json(errorResponse("server Error", "Something went wrong" ));
  }
});

app.get("/api/v1/content", (req, res) => {});

app.post("/api/v1/space/share", (req, res) => {});

app.get("/api/v1/brain/:sharelink", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
