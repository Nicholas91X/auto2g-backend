import 'express';
import { Account } from "@prisma/client"

declare module 'express' {
  export interface Request {
    user?: Account;
  }
}