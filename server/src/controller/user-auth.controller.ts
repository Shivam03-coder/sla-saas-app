import { Request, Response } from "express";
import {
  hashPassword,
  isEmailValid,
  isWeakpassword,
  options,
  verifyPassword,
} from "@src/helpers/shared-variables";
import {
  ApiError,
  ApiResponse,
  AsyncHandler,
} from "@src/helpers/server-functions";
import { db } from "@src/db";
import { AuthUtility } from "@src/utils/auth-utils";

export class UserAuthController {
  // SIGNUP
  public static UserSignup = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const {
        firstName,
        lastName,
        emailAddress,
        password: plainPassword,
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !emailAddress || !plainPassword) {
        throw new ApiError(400, "Fields cannot be empty");
      }

      // Validate email format
      if (!isEmailValid(emailAddress)) {
        throw new ApiError(400, "Email is not valid");
      }

      // Validate password strength
      if (!isWeakpassword(plainPassword)) {
        throw new ApiError(400, "Password is weak");
      }

      // Check if email already exists
      const isEmailAlreadyExist = await db.user.findUnique({
        where: {
          emailAddress,
        },
        select: {
          id: true,
        },
      });

      if (isEmailAlreadyExist) {
        throw new ApiError(400, "Email already exists");
      }

      // Hash the password
      const hashedPassword = await hashPassword(plainPassword);

      // Create new user in the database
      const RegisteredUser = await db.user.create({
        data: {
          firstName,
          lastName,
          emailAddress,
          password: hashedPassword,
        },
        select: {
          firstName: true,
          lastName: true,
          emailAddress: true,
          imageUrl: true,
        },
      });

      // Respond with success
      res.json(new ApiResponse(200, "Signup Successful", RegisteredUser));
    }
  );

  // SIGNIN
  public static UserSignin = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { emailAddress, password: plainPassword } = req.body;

      const registeredUser = await db.user.findUnique({
        where: { emailAddress },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          emailAddress: true,
          password: true,
          imageUrl: true,
          role: true,
        },
      });

      if (!registeredUser) {
        throw new ApiError(400, "User does not exist");
      }

      const isPasswordCorrect = await verifyPassword(
        plainPassword,
        registeredUser.password
      );

      if (!isPasswordCorrect) {
        throw new ApiError(400, "Password is incorrect");
      }

      const { accessToken, refreshToken } =
        AuthUtility.generateTokens(registeredUser);

      await db.token.create({
        data: {
          userId: registeredUser.id,
          refreshToken,
        },
      });

      const refinedUser = {
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        emailAddress: registeredUser.emailAddress,
        imageUrl: registeredUser.imageUrl,
      };

      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "Login successful", refinedUser));
    }
  );

  // USER PROFILE
  public static GetUserProfile = AsyncHandler(
    async (req: Request, res: Response) => {
      res.send(new ApiResponse(200, "Sucess", req.user));
    }
  );
}
