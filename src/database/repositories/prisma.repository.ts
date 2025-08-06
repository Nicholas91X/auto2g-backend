import { PrismaClient } from '@prisma/client';
import { Injectable } from "@nestjs/common"

@Injectable()
export class PrismaRepository extends PrismaClient {}
