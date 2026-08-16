/**
 * Create body for `POST /users`. Field names match the API exactly — the form
 * collects into this shape so no mapping is needed on submit.
 */
export interface UserPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  status?: "active" | "inactive";
}

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
