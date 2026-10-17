

// The logged-in user, as the guard attaches it to the request. Never contains the password.

import { Request } from "express";
import { User } from "../../generated/prisma/client.js";

export type AuthUser = Omit<User, 'password'>;

export interface AuthenticatedRequest extends Request{
    user: AuthUser
}