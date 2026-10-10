import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '../../generated/prisma/client.js';
import { ApiErrorResponse, FieldError } from '../interfaces/api-response.interface.js';
import { PrismaErrorCode } from '../../prisma/prisma-errors.js';

interface MappedError {
  statusCode: number;
  message: string;
  errors?: FieldError[];
}

const INTERNAL_ERROR: MappedError = {
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  message: 'Internal server error',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const { statusCode, message, errors } = this.mapException(exception);

    // 5xx = our bug or infrastructure problem: always log with the stack trace
    if (statusCode >= 500) {
      this.logger.error(
        `${httpAdapter.getRequestMethod(request)} ${httpAdapter.getRequestUrl(request)} → ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      ...(errors?.length ? { errors } : {}),
      path: httpAdapter.getRequestUrl(request),
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), body, statusCode);
  }

  private mapException(exception: unknown): MappedError {
    if (exception instanceof HttpException) {
      return this.mapHttpException(exception);
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaKnownError(exception);
    }
    // Everything else (PrismaClientValidationError, TypeError, DB down...) is a server bug
    return INTERNAL_ERROR;
  }

  private mapHttpException(exception: HttpException): MappedError {
    const statusCode = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { statusCode, message: payload };
    }

    const body = payload as { message?: string | string[]; errors?: FieldError[] };

    // Our validationExceptionFactory, or a service that passes { message, errors }
    if (Array.isArray(body.errors)) {
      return { statusCode, message: body.message?.toString() ?? exception.message, errors: body.errors };
    }
    // Nest's default array form, e.g. from a pipe without our factory
    if (Array.isArray(body.message)) {
      return {
        statusCode,
        message: 'Validation failed',
        errors: body.message.map((message) => ({ message })),
      };
    }
    return { statusCode, message: body.message ?? exception.message };
  }

  private mapPrismaKnownError(exception: Prisma.PrismaClientKnownRequestError): MappedError {
    switch (exception.code) {
      case PrismaErrorCode.UniqueConstraintFailed:
        return { statusCode: HttpStatus.CONFLICT, message: 'A record with this value already exists' };
      case PrismaErrorCode.RecordNotFound:
        return { statusCode: HttpStatus.NOT_FOUND, message: 'Record not found' };
      case PrismaErrorCode.ValueTooLong:
        return { statusCode: HttpStatus.BAD_REQUEST, message: 'Input value is too long' };
      default:
        return INTERNAL_ERROR;
    }
  }
}
