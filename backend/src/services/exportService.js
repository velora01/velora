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
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${title.replace(/\s+/g, "_")}.pdf"`);

  doc.pipe(res);

  // Velora Gold luxury header styling
  doc.fillColor("#9E7B1D").fontSize(20).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", { align: "center" });
  doc.moveDown(0.2);
  doc.fillColor("#64748B").fontSize(8).font("Helvetica-Oblique").text("Bespoke Designs • Premium Materials • Flawless Execution", { align: "center" });
  doc.moveDown(0.5);
  doc.fillColor("#1E293B").fontSize(13).font("Helvetica-Bold").text(title, { align: "center" });
  doc.moveDown(0.8);
  doc.strokeColor("#C5A059").lineWidth(1.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1.5);

  doc.fillColor("#1C1917").fontSize(10).font("Helvetica");
  dataLines.forEach((line) => {
    // Replace rupee symbol with Rs. to prevent font encoding glitches
    const safeLine = line.replace(/₹/g, "Rs. ");
    doc.text(safeLine, { paragraphGap: 6 });
  });

  doc.moveDown(2);
  doc.fontSize(8).fillColor("#888888").text("Generated automatically by Velora CRM ERP", { align: "center" });

  doc.end();
};

/**
 * Helper to convert number to Indian Rupee Words
 */
export const numberToWordsIN = (num) => {
  if (!num || isNaN(num)) return "Zero Rupees Only";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    let n_arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_arr) return '';
    let str = '';
    str += (n_arr[1] != 0) ? (a[Number(n_arr[1])] || b[n_arr[1][0]] + ' ' + a[n_arr[1][1]]) + 'Crore ' : '';
    str += (n_arr[2] != 0) ? (a[Number(n_arr[2])] || b[n_arr[2][0]] + ' ' + a[n_arr[2][1]]) + 'Lakh ' : '';
    str += (n_arr[3] != 0) ? (a[Number(n_arr[3])] || b[n_arr[3][0]] + ' ' + a[n_arr[3][1]]) + 'Thousand ' : '';
    str += (n_arr[4] != 0) ? (a[Number(n_arr[4])] || b[n_arr[4][0]] + ' ' + a[n_arr[4][1]]) + 'Hundred ' : '';
    str += (n_arr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_arr[5])] || b[n_arr[5][0]] + ' ' + a[n_arr[5][1]]) : '';
    return str;
  };
  return `${inWords(Math.round(num)).trim()} Rupees Only`;
};

/**
 * High-End Luxury Tax Invoice PDF Generator for Velora Luxury Interiors (Matching images 1-4)
 */
export const generateInvoicePdfDoc = (res, invoice = {}) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  const invNum = invoice.invoiceNumber || "NCIA003";
  const filename = `Tax_Invoice_${invNum}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  doc.pipe(res);

  // Palette
  const darkNavy = "#0F172A";
  const headerBlue = "#4378F0";
  const gold = "#D4AF37";
  const charcoal = "#1E293B";
  const slate = "#475569";
  const lightGrey = "#F8FAFC";
  const borderGrey = "#CBD5E1";

  // --- PAGE 1: Header, Company & Client Info, Items Table ---
  doc.rect(40, 35, 75, 45).fill(darkNavy);
  doc.fillColor(gold).fontSize(9).font("Helvetica-Bold").text("VELORA", 52, 53);

  doc.fillColor(darkNavy).fontSize(16).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 130, 48);

  doc.fillColor(darkNavy).fontSize(12).font("Helvetica-Bold").text("TAX INVOICE", 410, 38, { align: "right" });

  doc.strokeColor(headerBlue).lineWidth(1).rect(370, 48, 185, 45).stroke();
  doc.rect(370, 48, 185, 14).fill(headerBlue);
  doc.fillColor("#FFFFFF").fontSize(7.5).font("Helvetica-Bold").text("Original For Recipient", 370, 52, { width: 185, align: "center" });

  doc.fillColor(charcoal).fontSize(7.5).font("Helvetica").text("E-INVOICE NO:", 376, 68);
  doc.font("Helvetica-Bold").text(invNum, 470, 68);

  doc.font("Helvetica").text("INVOICE DATE:", 376, 80);
  const issueDateStr = new Date(invoice.issueDate || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  doc.font("Helvetica-Bold").text(issueDateStr, 470, 80);

  let startY = 100;

  const drawSectionBox = (x, y, w, h, title) => {
    doc.rect(x, y, w, 16).fill(headerBlue);
    doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text(title, x + 6, y + 4);
    doc.strokeColor(borderGrey).lineWidth(0.75).rect(x, y + 16, w, h - 16).stroke();
  };

  // Section 1: INVOICE FROM vs PROJECT INFORMATION
  drawSectionBox(40, startY, 252, 80, "INVOICE FROM");
  drawSectionBox(303, startY, 252, 80, "PROJECT INFORMATION");

  doc.fontSize(7).font("Helvetica-Bold").fillColor(charcoal);
  doc.text("LEGAL NAME:", 46, startY + 23);
  doc.font("Helvetica").text("VELORA LUXURY INTERIORS", 115, startY + 23);

  doc.font("Helvetica-Bold").text("GST NO:", 46, startY + 34);
  doc.font("Helvetica").text("27CHCPS9945R1Z4", 115, startY + 34);

  doc.font("Helvetica-Bold").text("PAN NO:", 46, startY + 45);
  doc.font("Helvetica").text("CHCPS9945R", 115, startY + 45);

  doc.font("Helvetica-Bold").text("STATE:", 46, startY + 56);
  doc.font("Helvetica").text("Maharashtra", 115, startY + 56);

  doc.font("Helvetica-Bold").text("EMAIL:", 46, startY + 67);
  doc.font("Helvetica").text("info@veloraluxury.com", 115, startY + 67);

  doc.font("Helvetica-Bold").text("CONTACT NO:", 46, startY + 78);
  doc.font("Helvetica").text("8055526603", 115, startY + 78);

  // Project Info
  doc.font("Helvetica-Bold").fillColor(charcoal);
  doc.text("PROJECT NAME:", 308, startY + 23);
  doc.font("Helvetica").text((invoice.projectName || invoice.clientName || "PREM SHUKLA").toUpperCase(), 385, startY + 23);

  doc.font("Helvetica-Bold").text("PROJECT (PID):", 308, startY + 34);
  doc.font("Helvetica").text(invoice.projectNumber || "PRJ-2026-008", 385, startY + 34);

  doc.font("Helvetica-Bold").text("PLACE OF SUPPLY:", 308, startY + 45);
  doc.font("Helvetica").text("Maharashtra (27)", 385, startY + 45);

  // Section 2: Bill To vs Ship To
  startY += 90;
  drawSectionBox(40, startY, 252, 75, "Details of Receiver (Bill to)");
  drawSectionBox(303, startY, 252, 75, "Details of Consignee (Ship to)");

  const clientName = invoice.billTo?.name || invoice.clientName || "PREM SHUKLA";
  const clientPhone = invoice.billTo?.phone || invoice.clientPhone || "+91 78000 20496";
  const clientEmail = invoice.billTo?.email || invoice.clientEmail || "PREMSHUKLA@GMAIL.COM";
  const clientAddr = invoice.billTo?.address || invoice.clientAddress || "402, Wakad Chowk, Hinjewadi Road, Wakad, Pune 411057";

  const shipName = invoice.shipTo?.name || (invoice.sameAsBillTo ? clientName : "-");
  const shipPhone = invoice.shipTo?.phone || (invoice.sameAsBillTo ? clientPhone : "-");
  const shipEmail = invoice.shipTo?.email || (invoice.sameAsBillTo ? clientEmail : "-");
  const shipAddr = invoice.shipTo?.address || (invoice.sameAsBillTo ? clientAddr : "-");

  // Bill To
  doc.font("Helvetica-Bold").fillColor(charcoal);
  doc.text("CLIENT NAME:", 46, startY + 23);
  doc.font("Helvetica-Bold").text(clientName.toUpperCase(), 115, startY + 23, { width: 170 });

  doc.font("Helvetica-Bold").text("CONTACT NO:", 46, startY + 34);
  doc.font("Helvetica").text(clientPhone, 115, startY + 34);

  doc.font("Helvetica-Bold").text("ADDRESS:", 46, startY + 45);
  doc.font("Helvetica").text(clientAddr, 115, startY + 45, { width: 170 });

  doc.font("Helvetica-Bold").text("EMAIL:", 46, startY + 62);
  doc.font("Helvetica").text(clientEmail, 115, startY + 62);

  doc.font("Helvetica-Bold").text("PIN CODE:", 46, startY + 73);
  doc.font("Helvetica").text("411057", 115, startY + 73);

  // Ship To
  doc.font("Helvetica-Bold").fillColor(charcoal);
  doc.text("CLIENT NAME:", 308, startY + 23);
  doc.font("Helvetica-Bold").text(shipName.toUpperCase(), 380, startY + 23, { width: 170 });

  doc.font("Helvetica-Bold").text("CONTACT NO:", 308, startY + 34);
  doc.font("Helvetica").text(shipPhone, 380, startY + 34);

  doc.font("Helvetica-Bold").text("ADDRESS:", 308, startY + 45);
  doc.font("Helvetica").text(shipAddr, 380, startY + 45, { width: 170 });

  doc.font("Helvetica-Bold").text("EMAIL:", 308, startY + 62);
  doc.font("Helvetica").text(shipEmail, 380, startY + 62);

  doc.font("Helvetica-Bold").text("PIN CODE:", 308, startY + 73);
  doc.font("Helvetica").text("411057", 380, startY + 73);

  // Items Table matching Image 2
  startY += 85;

  const rawItems = (invoice.items && invoice.items.length > 0)
    ? invoice.items
    : [
        { productName: "Queen Size Bed, With Cushion", uom: "30", quantity: 1, rate: 36000, total: 36000 },
        { productName: "King Size Bed Hydrolic", uom: "45.5", quantity: 1, rate: 64000, total: 64000 },
        { productName: "Openable Wardrobe 1", uom: "42.5", quantity: 1, rate: 55000, total: 55000 },
        { productName: "Openable Wardrobe 2, Study Table", uom: "59.5, 2'", quantity: 1, rate: 71400, total: 71400 },
        { productName: "Openable Wardrobe 3, Study Table", uom: "34", quantity: 1, rate: 40800, total: 40800 },
        { productName: "Study Table", uom: "56", quantity: 1, rate: 67200, total: 67200 },
        { productName: "Side Table", uom: "1.96", quantity: 4, rate: 5500, total: 22000 },
        { productName: "Dressing", uom: "-", quantity: 3, rate: 21000, total: 63000 },
        { productName: "Shoe Rack , With Side Sitting", uom: "12", quantity: 1, rate: 14400, total: 14400 },
        { productName: "Dinning Table", uom: "-", quantity: 1, rate: 35000, total: 35000 }
      ];

  const renderTableHeader = (currY) => {
    doc.rect(40, currY, 515, 18).fill(headerBlue);
    doc.fillColor("#FFFFFF").fontSize(7).font("Helvetica-Bold");
    doc.text("SL.NO", 42, currY + 5, { width: 30, align: "center" });
    doc.text("PRODUCT/SERVICE NAME", 75, currY + 5, { width: 160 });
    doc.text("HSN/SAC", 240, currY + 5, { width: 50, align: "center" });
    doc.text("UOM", 295, currY + 5, { width: 35, align: "center" });
    doc.text("QTY", 335, currY + 5, { width: 25, align: "center" });
    doc.text("UNIT RATE", 365, currY + 5, { width: 55, align: "right" });
    doc.text("TAX RATIO", 425, currY + 5, { width: 50, align: "center" });
    doc.text("TAXABLE AMOUNT", 480, currY + 5, { width: 70, align: "right" });
  };

  renderTableHeader(startY);
  let tableY = startY + 18;

  rawItems.forEach((it, idx) => {
    if (tableY > 720) {
      doc.addPage();
      doc.rect(40, 35, 515, 25).fill(darkNavy);
      doc.fillColor(gold).fontSize(11).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 50, 42);
      doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold").text(`TAX INVOICE (${invNum}) - Contd.`, 390, 42, { align: "right" });
      tableY = 65;
      renderTableHeader(tableY);
      tableY += 18;
    }

    const rowBg = idx % 2 === 0 ? "#FFFFFF" : lightGrey;
    doc.rect(40, tableY, 515, 16).fill(rowBg);
    doc.strokeColor(borderGrey).lineWidth(0.5).rect(40, tableY, 515, 16).stroke();

    const name = it.productName || it.description || "Turnkey Interior Component";
    const hsn = it.hsnSac || "995476";
    const uom = it.uom || it.unit || "-";
    const qty = it.quantity || 1;
    const rate = Number(it.rate) || 0;
    const total = Number(it.total) || (rate * qty);

    doc.fillColor(charcoal).fontSize(7).font("Helvetica");
    doc.text(String(idx + 1), 42, tableY + 4, { width: 30, align: "center" });
    doc.font("Helvetica-Bold").text(name, 75, tableY + 4, { width: 160 });
    doc.font("Helvetica").fillColor(slate).text(hsn, 240, tableY + 4, { width: 50, align: "center" });
    doc.text(String(uom), 295, tableY + 4, { width: 35, align: "center" });
    doc.fillColor(charcoal).text(String(qty), 335, tableY + 4, { width: 25, align: "center" });
    doc.text(`Rs. ${Math.round(rate).toLocaleString("en-IN")}`, 365, tableY + 4, { width: 55, align: "right" });
    doc.text("0%", 425, tableY + 4, { width: 50, align: "center" });
    doc.font("Helvetica-Bold").text(`Rs. ${Math.round(total).toLocaleString("en-IN")}`, 480, tableY + 4, { width: 70, align: "right" });

    tableY += 16;
  });

  const grandTotal = Number(invoice.grandTotal) || rawItems.reduce((acc, i) => acc + (Number(i.total) || 0), 0) || 468800;
  const subtotal = Number(invoice.subtotal) || grandTotal;

  // Subtotal & Grand Total rows
  doc.rect(40, tableY, 515, 16).fill("#FFFFFF");
  doc.strokeColor(borderGrey).rect(40, tableY, 515, 16).stroke();
  doc.fillColor(charcoal).fontSize(7.5).font("Helvetica-Bold").text("Sub Total Amount", 350, tableY + 4, { width: 125, align: "right" });
  doc.text(`Rs. ${Math.round(subtotal).toLocaleString("en-IN")}`, 480, tableY + 4, { width: 70, align: "right" });
  tableY += 16;

  doc.rect(40, tableY, 515, 18).fill(headerBlue);
  doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text("Grand Total Amount", 350, tableY + 5, { width: 125, align: "right" });
  doc.text(`Rs. ${Math.round(grandTotal).toLocaleString("en-IN")}`, 480, tableY + 5, { width: 70, align: "right" });
  tableY += 22;

  // Amount in Words
  doc.strokeColor(borderGrey).rect(40, tableY, 515, 20).stroke();
  doc.rect(40, tableY, 170, 20).fill("#E2E8F0");
  doc.fillColor(charcoal).fontSize(7.5).font("Helvetica-Bold").text("Total Invoice Amount In Words", 46, tableY + 6);
  doc.text(numberToWordsIN(grandTotal), 220, tableY + 6);

  // --- PAGE 2: Bank Details, Scan to Pay, Notes & Terms & Conditions ---
  doc.addPage();
  let p2Y = 40;

  drawSectionBox(40, p2Y, 515, 75, "BANK DETAILS & PAYMENT INSTRUCTIONS");
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(charcoal);
  doc.text("Account Holder: VELORA LUXURY INTERIORS", 48, p2Y + 25);
  doc.font("Helvetica").text("Account Number: 50200073374185", 48, p2Y + 37);
  doc.text("IFSC: HDFC0000223 | Branch: WAKAD / PASHAN", 48, p2Y + 49);
  doc.text("Account Type: Current Account", 48, p2Y + 61);

  p2Y += 85;
  doc.setFont("Helvetica-Bold").fontSize(9).text("Scan to pay", 40, p2Y);
  doc.rect(40, p2Y + 8, 90, 75).stroke();
  doc.fontSize(6.5).font("Helvetica").text("[ PhonePe / UPI QR Code ]", 45, p2Y + 45);

  p2Y += 95;
  drawSectionBox(40, p2Y, 515, 30, "Notes");
  doc.fontSize(7).font("Helvetica").fillColor(charcoal).text("Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.", 48, p2Y + 22);

  p2Y += 38;
  drawSectionBox(40, p2Y, 515, 500, "Terms & Conditions");
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(charcoal).text("TERMS & CONDITIONS - For Interior Design & Turnkey Execution Services", 48, p2Y + 24);

  doc.fontSize(6.5).font("Helvetica").fillColor(slate);
  let termY = p2Y + 38;

  const printTerm = (title, body) => {
    doc.font("Helvetica-Bold").text(title, 48, termY);
    termY += 9;
    doc.font("Helvetica");
    const lines = doc.splitTextToSize(body, 500);
    doc.text(lines, 48, termY);
    termY += (lines.length * 7.5) + 5;
  };

  printTerm("1. Scope of Work", "The scope of work includes interior design consultancy, space planning, material selection, 2D/3D drawings, furniture design, civil work, electrical work, false ceiling, modular furniture, décor assistance, site supervision, and turnkey execution as mutually agreed in the final quotation/work order.");
  printTerm("2. Design Process", "1. Initial consultation. 2. Concept design and layout planning. 3. Material selection. 4. Final design approval. 5. Execution and site coordination. 6. Project handover.");
  printTerm("3. Quotation & Pricing", "All quotations are valid for 15 days from issue date. Prices are based on current market rates.");
  printTerm("4. Payment Terms", "10% Advance (Booking & Design Initiation), 40% (Before Production/Execution), 40% (During Execution Stage), 10% (Before Final Handover).");
  printTerm("5. Project Timeline", "Timelines are estimated based on project scope & site conditions. Working days exclude Sundays and public holidays.");
  printTerm("6. Client Responsibilities", "Provide timely approvals, ensure site accessibility, clear all dues as per payment schedule.");
  printTerm("7. Material & Finishes", "Natural variations in wood, veneer, marble, laminates, fabric, stone are normal and not defects.");
  printTerm("8. Warranty", "Modular Furniture & Interior Work Warranty - 5 years for manufacturing defects.");

  // --- PAGE 3: Terms Part 2, Signatures & Common Seal ---
  doc.addPage();
  doc.rect(40, 40, 515, 620).stroke();
  termY = 55;

  printTerm("9. Cancellation Policy", "Booking amount/design fees non-refundable. Charges for completed work/materials procured recoverable.");
  printTerm("10. Ownership of Designs", "All drawings, concepts, renders, and designs remain intellectual property of VELORA LUXURY INTERIORS.");
  printTerm("11. Photography & Portfolio Rights", "Company reserves right to photograph completed projects for portfolio/social media.");
  printTerm("12. Limitation of Liability", "Company not liable for structural defects, existing site issues, external agency delays.");
  printTerm("13. Force Majeure", "Company not responsible for delays caused by natural disasters, strikes, pandemic, supply disruptions.");
  printTerm("14. Dispute Resolution", "Subject to jurisdiction of Pune, Maharashtra courts only.");
  printTerm("15. Acceptance", "Approval of quotation/work order and payment of advance shall be considered acceptance of these T&C.");

  termY += 15;
  doc.fontSize(8).font("Helvetica").fillColor(charcoal);
  doc.text("Client Signature: _______________________", 48, termY);
  doc.text("Date: _________________", 260, termY);

  termY += 25;
  doc.font("Helvetica-Bold").text("Authorized Signatory", 48, termY);
  doc.font("Helvetica-Bold").fillColor(darkNavy).text("VELORA LUXURY INTERIORS", 48, termY + 12);

  const sealY = 675;
  doc.rect(40, sealY, 515, 16).fill(headerBlue);
  doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 48, sealY + 4);

  doc.strokeColor(borderGrey).rect(40, sealY + 16, 515, 60).stroke();
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(slate).text("Authorised Common seal", 40, sealY + 62, { width: 515, align: "center" });

  doc.fontSize(7).font("Helvetica").fillColor(slate).text("This is a computer generated invoice, Hence no signature is required.", 40, sealY + 84, { width: 515, align: "center" });

  doc.end();
};

export const generateBOQPdf = (res, boq) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${(boq.boqNumber || "BOQ").replace(/\s+/g, "_")}.pdf"`);

  doc.pipe(res);

  // Colors
  const gold = "#C5A059";
  const darkGold = "#9E7B1D";
  const charcoal = "#1C1917";
  const slate = "#475569";
  const lightGrey = "#F1F5F9";

  // Header Logo / Brand
  doc.fillColor(darkGold).fontSize(22).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", { align: "center" });
  doc.moveDown(0.2);
  doc.fillColor(slate).fontSize(8).font("Helvetica-Oblique").text("Bespoke Designs • Premium Materials • Flawless Execution", { align: "center" });
  doc.moveDown(0.8);
  doc.strokeColor(gold).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // Title
  doc.fillColor(charcoal).fontSize(14).font("Helvetica-Bold").text(`PROJECT ESTIMATE & QUOTATION`, { align: "left" });
  doc.moveDown(0.6);

  // Metadata Card (Client & Quote Details)
  const metaY = doc.y;
  doc.fillColor(charcoal).fontSize(10).font("Helvetica-Bold").text("CLIENT DETAILS");
  doc.font("Helvetica").fontSize(9);
  doc.text(`Client Name: ${boq.clientName || "Valued Client"}`);
  if (boq.lead && typeof boq.lead === "object") {
    doc.text(`Email: ${boq.lead.email || "N/A"}`);
    doc.text(`Phone: ${boq.lead.phone || "N/A"}`);
    doc.text(`Site Address: ${boq.lead.address || "Pune"}`);
    doc.text(`Site Area: ${boq.lead.siteArea || "0"} sq.ft. | Possession: ${boq.lead.possessionStatus || "N/A"}`);
    doc.text(`Design Style: ${boq.lead.stylePreference || "Modern"}`);
  } else {
    doc.text(`Address: Pune, Maharashtra`);
  }

  // Quote details on the right column
  doc.font("Helvetica-Bold").text("ESTIMATE DETAILS", 320, metaY);
  doc.font("Helvetica").fontSize(9);
  doc.text(`Estimate Ref: ${boq.boqNumber}`, 320, metaY + 12);
  doc.text(`Date: ${new Date(boq.createdAt || Date.now()).toLocaleDateString("en-IN")}`, 320, metaY + 24);
  doc.text(`Prepared By: ${boq.preparedBy || "Design Team"}`, 320, metaY + 36);
  doc.text(`Status: ${boq.status || "Draft"}`, 320, metaY + 48);

  doc.x = 50; // Reset X position
  doc.y = metaY + 105;
  doc.moveDown(1);

  // Rooms / Spaces and Items table
  const spaceList = (boq.spaces && boq.spaces.length > 0) ? boq.spaces : (boq.rooms || []);

  if (spaceList.length > 0) {
    spaceList.forEach((space) => {
      // Room / Space Header
      if (doc.y > 680) {
        doc.addPage();
        doc.fillColor(darkGold).fontSize(14).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 50, 40);
        doc.strokeColor(gold).lineWidth(1).moveTo(50, 58).lineTo(545, 58).stroke();
        doc.y = 70;
      }
      doc.fillColor(darkGold).fontSize(12).font("Helvetica-Bold").text(space.name, { underline: true });
      doc.moveDown(0.4);

      // Table Header
      const headerY = doc.y;
      doc.fillColor(slate).fontSize(8).font("Helvetica-Bold");
      doc.text("Item / Component", 50, headerY, { width: 170 });
      doc.text("Type & Spec", 220, headerY, { width: 130 });
      doc.text("Size / Sqft", 350, headerY, { width: 60, align: "center" });
      doc.text("Qty", 410, headerY, { width: 25, align: "center" });
      doc.text("Rate (₹)", 435, headerY, { width: 50, align: "right" });
      doc.text("Total (₹)", 490, headerY, { width: 55, align: "right" });

      doc.moveDown(0.2);
      doc.strokeColor(lightGrey).lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);

      // Space Items
      const items = space.items || [];
      if (items.length > 0) {
        items.forEach((item) => {
          if (doc.y > 720) {
            doc.addPage();
            doc.fillColor(darkGold).fontSize(14).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 50, 40);
            doc.strokeColor(gold).lineWidth(1).moveTo(50, 58).lineTo(545, 58).stroke();
            doc.y = 70;
          }

          const itemY = doc.y;
          const name = item.name || item.itemName || "Component Item";
          const type = item.typeVariant || item.material || "Standard";
          const sizeText = item.sqft ? `${item.sqft} sq.ft` : (item.lengthFt ? `${item.lengthFt}x${item.heightFt} ft` : "-");
          const qty = item.qty || item.quantity || 1;
          const rate = item.rate || item.price || 0;
          const amount = item.amount || (rate * (item.sqft || qty));

          doc.fillColor(charcoal).fontSize(8).font("Helvetica");
          doc.text(name, 50, itemY, { width: 165 });
          doc.fillColor(slate).text(type, 220, itemY, { width: 125 });
          doc.fillColor(charcoal).text(sizeText, 350, itemY, { width: 60, align: "center" });
          doc.text(qty.toString(), 410, itemY, { width: 25, align: "center" });
          doc.text(Math.round(rate).toLocaleString("en-IN"), 435, itemY, { width: 50, align: "right" });
          doc.font("Helvetica-Bold").text(Math.round(amount).toLocaleString("en-IN"), 490, itemY, { width: 55, align: "right" });

          doc.font("Helvetica");
          doc.moveDown(0.5);
        });
      }

      doc.moveDown(0.3);
      doc.strokeColor(gold).lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      
      // Space Total
      const subtotalY = doc.y;
      doc.fillColor(darkGold).fontSize(9).font("Helvetica-Bold");
      doc.text(`${space.name} Total:`, 300, subtotalY, { width: 185, align: "right" });
      const spaceTotal = space.roomTotal || items.reduce((s, it) => s + (it.amount || ((it.rate || 0) * (it.sqft || it.qty || 1))), 0);
      doc.text(`₹${Math.round(spaceTotal).toLocaleString("en-IN")}`, 490, subtotalY, { width: 55, align: "right" });

      doc.moveDown(1.5);
    });
  }

  // Summary box & totals
  if (doc.y > 620) {
    doc.addPage();
    doc.fillColor(darkGold).fontSize(14).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 50, 40);
    doc.strokeColor(gold).lineWidth(1).moveTo(50, 58).lineTo(545, 58).stroke();
    doc.y = 80;
  }

  const summaryY = doc.y;
  doc.strokeColor(gold).lineWidth(1).rect(50, summaryY, 495, 75).stroke();
  doc.fillColor(lightGrey).rect(51, summaryY + 1, 493, 73).fill();

  const grandTotal = boq.grandTotal || 0;
  const subtotal = boq.subtotal || Math.round(grandTotal / 1.18);
  const gstTotal = boq.gstTotal || (grandTotal - subtotal);

  doc.fillColor(charcoal).fontSize(10).font("Helvetica-Bold").text("COMMERCIAL SUMMARY", 65, summaryY + 12);
  doc.fontSize(9).font("Helvetica").fillColor(charcoal);
  doc.text(`Subtotal (Excl. GST):`, 65, summaryY + 30);
  doc.text(`₹${Math.round(subtotal).toLocaleString("en-IN")}`, 200, summaryY + 30);

  doc.text(`Estimated GST (18%):`, 65, summaryY + 45);
  doc.text(`₹${Math.round(gstTotal).toLocaleString("en-IN")}`, 200, summaryY + 45);

  doc.fontSize(11).font("Helvetica-Bold").fillColor(darkGold);
  doc.text(`GRAND TOTAL:`, 65, summaryY + 60);
  doc.text(`₹${Math.round(grandTotal).toLocaleString("en-IN")}`, 200, summaryY + 60);

  // Terms and conditions
  doc.y = summaryY + 95;
  doc.fillColor(charcoal).fontSize(10).font("Helvetica-Bold").text("TERMS & CONDITIONS & PAYMENT SCHEDULE");
  doc.fontSize(8).font("Helvetica").fillColor(slate);
  doc.moveDown(0.4);
  doc.text("1. Milestone Payments: 50% booking advance to confirm order; 40% upon production commencement; 10% on handover.");
  doc.text("2. Quotation is valid for 30 calendar days from issue date. Rates based on approved specifications.");
  doc.text("3. Delivery Timeline: 45 working days from sign-off of 2D/3D layouts and material selection.");
  doc.text("4. Any changes or additions to scope will be charged extra as per actual costs.");

  doc.moveDown(2);
  doc.fontSize(8).fillColor("#999999").text("This is an electronically generated estimate and does not require a physical signature.", { align: "center" });

  doc.end();
};
