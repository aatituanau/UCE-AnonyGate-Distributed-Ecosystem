import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Global logging interceptor to trace HTTP and RPC requests.
 * Mirrors the exact behavior from ms-auth and ms-submission.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ApplicationLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType();
    let requestInfo = 'Unknown context';

    if (type === 'http') {
      const request = context.switchToHttp().getRequest<{ method: string; url: string }>();
      requestInfo = `HTTP ${request.method} ${request.url}`;
    } else if (type === 'rpc') {
      requestInfo = `gRPC Call`;
    } else if (type === 'ws') {
      requestInfo = `WebSocket Message`;
    }

    const now = Date.now();
    this.logger.log(`[REQUEST IN] Starting: ${requestInfo}`);

    return next
      .handle()
      .pipe(
        tap({
          next: () => this.logger.log(`[RESPONSE OUT] Completed: ${requestInfo} [${Date.now() - now}ms]`),
          error: (error: Error) => this.logger.error(`[ERROR OUT] Failed: ${requestInfo} - Reason: ${error?.message || 'Unknown Error'} [${Date.now() - now}ms]`),
        }),
      );
  }
}
