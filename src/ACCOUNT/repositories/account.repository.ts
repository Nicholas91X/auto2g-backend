import { Injectable, NotFoundException } from "@nestjs/common"
import { Account, AccountRole } from "@prisma/client"
import { PrismaRepository } from "../../database/repositories/prisma.repository"

/**
 * Repository per la gestione delle operazioni di persistenza degli account.
 * Fornisce metodi per leggere, creare, aggiornare e cancellare account,
 * interagendo direttamente con il database tramite Prisma.
 */
@Injectable()
export class AccountRepository {
  constructor(private readonly db: PrismaRepository) {}

  // ---
  // ## Metodi di Lettura Account
  // ---
  // ---

  /**
   * Recupera tutti gli account nel sistema.
   * Considerare la paginazione per applicazioni di produzione con grandi dataset.
   * @returns Un array di oggetti Account.
   */
  async allAccounts(): Promise<Account[]> {
    return this.db.account.findMany()
  }

  /**
   * Trova account per ruolo.
   * Restituisce solo account attivi con il ruolo specificato.
   * @param role Il ruolo da cercare.
   * @returns Un array di oggetti Account.
   */
  async findByRole(role: AccountRole): Promise<Account[]> {
    return this.db.account.findMany({ where: { role, active: true } })
  }

  /**
   * Trova account in base al loro stato di attività.
   * @param active `true` per account attivi, `false` per account disattivati.
   * @returns Un array di oggetti Account.
   */
  async findByActive(active: boolean): Promise<Account[]> {
    return this.db.account.findMany({ where: { active } })
  }

  /**
   * Trova account in base al loro stato di verifica email.
   * @param verified `true` per account verificati, `false` per account non verificati.
   * @returns Un array di oggetti Account.
   */
  async findByVerified(verified: boolean): Promise<Account[]> {
    return this.db.account.findMany({ where: { verified } })
  }

  /**
   * Trova un account tramite il suo ID.
   * Lancia una `NotFoundException` se l'account non è trovato, tipico per operazioni che lo richiedono.
   * @param id L'ID dell'account.
   * @returns L'oggetto Account.
   * @throws NotFoundException Se l'account con l'ID specificato non esiste.
   */
  async findById(id: number): Promise<Account> {
    const account = await this.db.account.findUnique({ where: { id } })
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found.`)
    }
    return account
  }

  /**
   * Trova un account tramite il suo indirizzo email.
   * @param email L'indirizzo email dell'account.
   * @returns L'oggetto Account o `null` se non trovato.
   */
  async findByEmail(email: string): Promise<Account | null> {
    return this.db.account.findUnique({ where: { email } })
  }

  /**
   * Cerca account per nome, cognome o email.
   * La ricerca è case-insensitive e parziale.
   * @param search La stringa di ricerca.
   * @returns Un array di oggetti Account corrispondenti.
   */
  async searchByParams(search: string): Promise<Account[]> {
    return this.db.account.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { surname: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Conta il numero di account attivi con ruolo `ADMIN` o `SYSTEM_ADMIN`.
   * Utilizzato per i controlli di sicurezza prima di disabilitare/cancellare amministratori,
   * per garantire che ci sia sempre almeno un amministratore attivo.
   * @returns Il numero di amministratori attivi.
   */
  async countActiveAdmins(): Promise<number> {
    return this.db.account.count({
      where: {
        active: true,
        OR: [{ role: AccountRole.ADMIN }, { role: AccountRole.SYSTEM_ADMIN }],
      },
    })
  }

  // ---
  // ## Metodi di Creazione Account
  // ---

  /**
   * Crea un nuovo account utente.
   * @param dto Dati per la creazione dell'account.
   * @returns L'oggetto Account appena creato.
   */
  async createAccount(dto: {
    email: string
    name: string
    surname: string
    password: string
    phoneNumber: string | null
    profilePicture: string | null
    role: AccountRole
  }): Promise<Account> {
    return this.db.account.create({ data: dto })
  }

  // ---
  // ## Metodi di Aggiornamento Account
  // ---

  /**
   * Marchia un account come verificato.
   * @param id L'ID dell'account da verificare.
   */
  async verifyUser(id: number): Promise<void> {
    await this.db.account.update({
      where: { id },
      data: { verified: true },
    })
  }

  /**
   * Aggiorna i dati di un account specifico.
   * @param id L'ID dell'account da aggiornare.
   * @param data I dati da aggiornare (partial).
   * @returns L'oggetto Account aggiornato.
   */
  async updateAccount(
    id: number,
    data: Partial<{
      name: string
      surname: string
      email: string
      password: string
      phoneNumber: string
      fiscalCode: string
      active: boolean
      verified: boolean
      profilePicture: string
    }>,
  ): Promise<Account> {
    return this.db.account.update({
      where: { id },
      data,
    })
  }

  // ---
  // ## Metodi di Cancellazione Account (Logica)
  // ---

  /**
   * Cancella logicamente un account impostando `active = false`.
   * Questo impedisce all'utente di accedere pur mantenendo i suoi dati.
   * @param accountId L'ID dell'account da disattivare.
   * @returns L'oggetto Account aggiornato (disattivato).
   */
  async delete(accountId: number): Promise<Account> {
    return this.db.account.update({
      where: { id: accountId },
      data: { active: false },
    })
  }

  /**
   * Esegue una cancellazione fisica (hard delete) di un account dal database.
   * Da usare con cautela, solo quando la cancellazione logica non è sufficiente.
   * @param id L'ID dell'account da eliminare fisicamente.
   */
  async deletePhysically(id: number): Promise<Account> {
    return this.db.account.delete({
      where: { id },
    });
  }
}