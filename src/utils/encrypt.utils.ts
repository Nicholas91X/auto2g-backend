import * as bcrypt from "bcryptjs";

const hashingRounds = 5;

export class EncryptUtils {

  public static async encrypt(clearText: string) {
    return await bcrypt.hash(clearText, hashingRounds);
  }

  public static async match(clearText: string, encryptedText: string) {
    return await bcrypt.compare(clearText, encryptedText);
  }

  /**
   * Genera una password temporanea sicura con caratteri casuali.
   * @returns La password temporanea generata.
   */
  public static async generateTempPassword(): Promise<string> {
    const length = 10
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#"
    let password = ""
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length)
      password += chars.charAt(index)
    }
    return password
  }

  /**
   * Genera una password temporanea sicura con caratteri casuali.
   * @returns La password temporanea generata.
   */
  public static async generateTempEncryptedPassword(): Promise<{ tempPw: string; encryptedPw: string }> {
    const length = 10
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#"
    let password = ""
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length)
      password += chars.charAt(index)
    }
    return {
      tempPw: password,
      encryptedPw: await this.encrypt(password)
    }
  }
}
