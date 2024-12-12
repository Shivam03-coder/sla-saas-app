import { appEnvConfigs } from "@src/configs";
import { db } from "@src/db";
import jwt from "jsonwebtoken";
import { UserType } from "@src/types/types";
import { ApiError } from "@src/helpers/server-functions";

export class AuthUtility {
  // Function to generate access and refresh tokens for a user
  public static generateTokens = (
    registeredUser: UserType
  ): { accessToken: string; refreshToken: string } => {
    if (
      !appEnvConfigs.ACCESS_TOKEN_SECRET_KEY ||
      !appEnvConfigs.REFRESH_TOKEN_SECRET_KEY
    ) {
      throw new ApiError(409, "Token signing keys are not properly configured");
    }

    const signToken = (key: string, expiresIn: string) =>
      jwt.sign(
        { _id: registeredUser.id, email: registeredUser.emailAddress },
        key,
        { expiresIn }
      );

    return {
      accessToken: signToken(appEnvConfigs.ACCESS_TOKEN_SECRET_KEY, "4d"), // Access token expires in 4 days
      refreshToken: signToken(appEnvConfigs.REFRESH_TOKEN_SECRET_KEY, "12d"), // Refresh token expires in 12 days
    };
  };

  // Function to renew JWT tokens using an old refresh token
  public static RenewjwtTokens = async (oldRefreshToken: string) => {
    try {
      const authenticatedUser = await db.token.findUnique({
        where: {
          refreshToken: oldRefreshToken,
        },
        include: {
          user: true,
        },
      });

      if (!authenticatedUser) {
        throw new ApiError(409, "Please login again");
      }

      try {
        jwt.verify(
          oldRefreshToken,
          appEnvConfigs.REFRESH_TOKEN_SECRET_KEY! ?? ""
        );
      } catch (err) {
        throw new ApiError(409, "Invalid refresh token, please login again");
      }

      const { user } = authenticatedUser;

      if (!user) {
        throw new Error("USER NOT FOUND");
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        AuthUtility.generateTokens(user);

      await db.token.update({
        where: { refreshToken: oldRefreshToken },
        data: { refreshToken: newRefreshToken },
      });

      return { newAccessToken, newRefreshToken };
    } catch (err: any) {
      throw new ApiError(500, err.message || "Unexpected error occurred");
    }
  };
}
