import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export const generateExcelReport = async (res, filename, columns, rows) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  worksheet.columns = columns;
  worksheet.addRows(rows);

  // Styling header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1C1917" } // Luxury dark header
  };

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
};

export const generatePdfDoc = (res, title, dataLines = []) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${title.replace(/\s+/g, "_")}.pdf"`);

  doc.pipe(res);

  // Velora Gold luxury header styling
  doc.fillColor("#C9A227").fontSize(22).text("VELORA LUXURY INTERIORS", { align: "center" });
  doc.moveDown(0.5);
  doc.fillColor("#333333").fontSize(14).text(title, { align: "center" });
  doc.moveDown(1);
  doc.strokeColor("#C9A227").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1.5);

  doc.fillColor("#1C1917").fontSize(11);
  dataLines.forEach((line) => {
    doc.text(line, { paragraphGap: 6 });
  });

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#888888").text("Generated automatically by Velora CRM ERP", { align: "center" });

  doc.end();
};
