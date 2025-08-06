import { ArgumentsHost, Catch, HttpStatus } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Response } from "express";
import { Prisma } from "@prisma/client";

@Catch(Prisma.PrismaClientKnownRequestError)
export class DatabaseExceptionFilter<T> extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, "");

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    switch (exception.code) {
      case "P2002": {
        status = HttpStatus.CONFLICT;
        break;
      }
      case "P2025": {
        status = HttpStatus.NOT_FOUND;
        break;
      }
      default:
        super.catch(exception, host);
        return;
    }
    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}