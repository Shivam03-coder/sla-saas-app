import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { appEnvConfigs } from "@src/configs"; // Replace with your configuration file
import { db } from "@src/db"; // Replace with your database setup

interface JwtPayload {
  _id: string; // Replace with the structure of your JWT payload
}

if (!appEnvConfigs.ACCESS_TOKEN_SECRET_KEY) {
  throw new Error("ACCESS_TOKEN_SECRET_KEY is not defined in environment");
}

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: appEnvConfigs.ACCESS_TOKEN_SECRET_KEY,
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload: JwtPayload, done) => {
    try {
      const user = await db.user.findUnique({
        where: { id: jwtPayload._id },
        select: {
          id: true,
          role: true,
          emailAddress: true,
        },
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.error("Error in Passport JWT Strategy:", error);
      return done(error, false);
    }
  })
);

export { passport };
