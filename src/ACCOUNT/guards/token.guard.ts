import { AuthGuard } from "@nestjs/passport"
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common"
import { Account } from "@prisma/client"
import { Reflector } from "@nestjs/core"
import { ROLES_KEY } from "../decorators/roles.decorator"

// AuthGuard refers to the PassPort Strategy with the same name
@Injectable()
export class TokenGuard extends AuthGuard("jwt-token") implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Autenticazione: Passport verifica se il JWT è valido.
    const authenticated = (await super.canActivate(context)) as boolean

    // Se l'autenticazione fallisce (JWT non valido o assente), nega l'accesso immediatamente.
    // AuthGuard lancia UnauthorizedException automaticamente
    if (!authenticated) {
      return false
    }

    // 2. Autorizzazione: Ottieni i ruoli richiesti dall'endpoint
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    // Se l'endpoint non ha il decoratore @Roles() (quindi requiredRoles è null/undefined/vuoto),
    // significa che qualsiasi utente autenticato può accedere.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    // 3. Ottieni l'utente autenticato dalla richiesta (popolato da Passport)
    const request = context.switchToHttp().getRequest()
    const user = request.user as Account // Assumi che req.user sia di tipo Account

    // Se l'utente non è presente o non ha un ruolo, nega l'accesso
    if (!user || !user.role) {
      throw new ForbiddenException(
        "Accesso negato: ruolo utente non disponibile.",
      )
    }

    // 4. Controlla se il ruolo dell'utente è tra quelli consentiti
    const hasRequiredRole = requiredRoles.includes(user.role.toString()) // Confronta il ruolo dell'utente con i ruoli richiesti

    if (!hasRequiredRole) {
      // Se l'utente non ha il ruolo richiesto, lancia un'eccezione di accesso negato.
      throw new ForbiddenException(
        `Accesso negato: il tuo ruolo (${user.role}) non è permesso.`,
      )
    }

    // Se l'utente è autenticato e ha il ruolo richiesto, concede l'accesso.
    return true
  }
}