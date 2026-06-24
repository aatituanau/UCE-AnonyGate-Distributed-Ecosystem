import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard to protect endpoints that require a valid JWT token.
 * This extends the default Passport JWT AuthGuard.
 * Used for endpoints accessed by Analysts and Admins.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
