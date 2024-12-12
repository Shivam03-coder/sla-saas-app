import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

export const isEmailValid = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isWeakpassword = (password: string): boolean => {
  if (password.length > 8) {
    return true;
  }
  if (!/[A-Z]/.test(password)) {
    return true;
  }
  if (!/[a-z]/.test(password)) {
    return true;
  }
  if (!/\d/.test(password)) {
    return true;
  }

  if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) {
    return true;
  }
  return false;
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashpass = await bcrypt.hash(password, saltRounds);
  return hashpass;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const isTokenExpired = (token: string | undefined): boolean => {
  if (!token) {
    return true;
  }

  const decodedToken = JWT.decode(token) as { exp?: number };

  if (!decodedToken || typeof decodedToken.exp !== "number") {
    return true;
  }

  const currentTime = Date.now() / 1000;

  return decodedToken.exp < currentTime;
};

export const options = {
  httpOnly: true,
  secure: true,
};