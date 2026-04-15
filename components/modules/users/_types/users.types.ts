export interface User {
  _id: string; // or object, but represented as string in UI
  name: string;
  userName: string;
  phone: string;
  image: string;
  email: string;
  status: "active" | "inactive";
  isVerified: boolean;
  isDeleted: boolean;
  agreedToTerms: boolean;
  createdAt: string;
  updatedAt: string;
}
