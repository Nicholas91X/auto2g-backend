import { Injectable } from "@nestjs/common"
import * as ExcelJS from "exceljs"

@Injectable()
export class ExcelService {
  async createExcel(
    headers: Partial<ExcelJS.Column>[],
    data: any[],
    worksheetName: string = "Sheet 1",
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(worksheetName)

    // Imposta gli header e formatta la prima riga
    worksheet.columns = headers
    worksheet.getRow(1).font = { bold: true }

    // Aggiungi i dati
    worksheet.addRows(data)

    // Scrivi il file in un buffer di memoria
    const buffer = await workbook.xlsx.writeBuffer()
    return buffer as unknown as Buffer
  }
}
