import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

/**
 * Guard to ensure the request has an 'X-Alias-Token' header.
 * This is used for public endpoints where the complainant wants to check their case status.
 */
@Injectable()
export class AliasTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const aliasToken = request.headers["x-alias-token"];

    if (!aliasToken || typeof aliasToken !== "string") {
      throw new UnauthorizedException(
        "Missing or invalid X-Alias-Token header",
      );
    }

    return true;
  }
}
