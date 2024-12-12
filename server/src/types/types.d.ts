namespace $Enums {
  export type Role = "user" | "admin" | "moderator";
}

export type UserType = {
  id: string;
  emailAddress: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: $Enums.Role;
};
