import { UserRole } from "../../generated/prisma/enums.js"


// What we put inside the access token. Keep it small, and never put secrets here:
// anyone holding the token can read this part.
export interface JwtPayload {
    sub: number
    role: UserRole
}