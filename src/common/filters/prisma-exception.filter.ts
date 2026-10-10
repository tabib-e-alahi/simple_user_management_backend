import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const httpException = this.toHttpException(exception);

    // Unmapped Prisma errors fall through to Nest's default handling: logged + 500
    super.catch(httpException ?? exception, host);
  }

  private toHttpException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpException | undefined {
    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        return new ConflictException('A record with this value already exists');
      case 'P2025': // Record required by the operation was not found
        return new NotFoundException('Record not found');
      case 'P2000': // Value too long for the column
        return new BadRequestException('Input value is too long');
      default:
        return undefined;
    }
  }
}
