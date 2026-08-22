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
 * High-End Luxury Tax Invoice PDF Generator for Velora Luxury Interiors
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
  const gold = "#D4AF37";
  const darkGold = "#9E7B1D";
  const charcoal = "#1E293B";
  const slate = "#475569";
  const lightGrey = "#F8FAFC";
  const borderGrey = "#CBD5E1";

  // 1. Top Header Banner
  doc.rect(40, 35, 515, 52).fill(darkNavy);

  // Brand Name & Subtitle on Top Left Banner
  doc.fillColor(gold).fontSize(16).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 52, 45);
  doc.fillColor("#94A3B8").fontSize(7.5).font("Helvetica-Oblique").text("Bespoke Designs • Turnkey Interior Solutions", 52, 65);

  // TAX INVOICE & Original Badge on Top Right Banner
  doc.fillColor("#FFFFFF").fontSize(14).font("Helvetica-Bold").text("TAX INVOICE", 410, 43, { align: "right" });
  doc.fillColor("#F59E0B").fontSize(7.5).font("Helvetica-Bold").text("ORIGINAL FOR RECIPIENT", 410, 63, { align: "right" });

  // Gold Accent Line
  doc.strokeColor(gold).lineWidth(2).moveTo(40, 87).lineTo(555, 87).stroke();

  let startY = 97;

  // Helper for drawing boxed sections with headers
  const drawSectionBox = (x, y, w, h, title) => {
    doc.rect(x, y, w, 18).fill(darkNavy);
    doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text(title, x + 8, y + 5);
    doc.strokeColor(borderGrey).lineWidth(0.75).rect(x, y + 18, w, h - 18).stroke();
  };

  // 2. Section 1: INVOICE FROM vs INVOICE & PROJECT DETAILS
  drawSectionBox(40, startY, 252, 85, "INVOICE FROM");
  drawSectionBox(303, startY, 252, 85, "INVOICE & PROJECT DETAILS");

  // Invoice From Content
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor(charcoal);
  doc.text("LEGAL NAME:", 48, startY + 25);
  doc.font("Helvetica").text("VELORA LUXURY INTERIORS", 115, startY + 25);

  doc.font("Helvetica-Bold").text("GST NO:", 48, startY + 36);
  doc.font("Helvetica").text("27CHCPS9945R1Z4", 115, startY + 36);

  doc.font("Helvetica-Bold").text("PAN NO:", 48, startY + 47);
  doc.font("Helvetica").text("CHCPS9945R", 115, startY + 47);

  doc.font("Helvetica-Bold").text("EMAIL / PHONE:", 48, startY + 58);
  doc.font("Helvetica").text("info@veloraluxury.com | 8055526603", 115, startY + 58);

  doc.font("Helvetica-Bold").text("ADDRESS:", 48, startY + 69);
  doc.font("Helvetica").text("Hinjawadi Wakad Chowk, Pune 411057", 115, startY + 69, { width: 170 });

  // Invoice Details Content
  doc.font("Helvetica-Bold").fillColor(charcoal);
  doc.text("INVOICE NO:", 311, startY + 25);
  doc.font("Helvetica-Bold").fillColor(darkGold).text(invNum, 395, startY + 25);

  doc.font("Helvetica-Bold").fillColor(charcoal).text("INVOICE DATE:", 311, startY + 36);
  const issueDateStr = new Date(invoice.issueDate || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  doc.font("Helvetica").text(issueDateStr, 395, startY + 36);

  doc.font("Helvetica-Bold").text("PROJECT NAME:", 311, startY + 47);
  doc.font("Helvetica").text((invoice.projectName || invoice.clientName || "PREM SHUKLA").toUpperCase(), 395, startY + 47, { width: 155 });

  doc.font("Helvetica-Bold").text("PROJECT (PID):", 311, startY + 58);
  doc.font("Helvetica").text(invoice.projectNumber || "PRJ-2026-008", 395, startY + 58);

  doc.font("Helvetica-Bold").text("PLACE OF SUPPLY:", 311, startY + 69);
  doc.font("Helvetica").text("Maharashtra (27)", 395, startY + 69);

  // 3. Section 2: BILL TO vs SHIP TO
  startY += 93;
  drawSectionBox(40, startY, 252, 75, "DETAILS OF RECEIVER (BILL TO)");
  drawSectionBox(303, startY, 252, 75, "DETAILS OF CONSIGNEE (SHIP TO)");

  const clientName = invoice.billTo?.name || invoice.clientName || "PREM SHUKLA";
  const clientPhone = invoice.billTo?.phone || invoice.clientPhone || "+91 78000 20496";
  const clientEmail = invoice.billTo?.email || invoice.clientEmail || "PREMSHUKLA@GMAIL.COM";
  const clientAddr = invoice.billTo?.address || invoice.clientAddress || "402, Wakad Chowk, Hinjewadi Road, Wakad, Pune 411057";

  const shipName = invoice.shipTo?.name || (invoice.sameAsBillTo ? clientName : "-");
  const shipPhone = invoice.shipTo?.phone || (invoice.sameAsBillTo ? clientPhone : "-");
  const shipEmail = invoice.shipTo?.email || (invoice.sameAsBillTo ? clientEmail : "-");
  const shipAddr = invoice.shipTo?.address || (invoice.sameAsBillTo ? clientAddr : "-");

  // Bill To Content
  doc.font("Helvetica-Bold").fillColor(charcoal);
  doc.text("CLIENT NAME:", 48, startY + 25);
  doc.font("Helvetica-Bold").text(clientName.toUpperCase(), 115, startY + 25, { width: 170 });

  doc.font("Helvetica-Bold").text("CONTACT NO:", 48, startY + 36);
  doc.font("Helvetica").text(clientPhone, 115, startY + 36);

  doc.font("Helvetica-Bold").text("EMAIL:", 48, startY + 47);
  doc.font("Helvetica").text(clientEmail, 115, startY + 47);

  doc.font("Helvetica-Bold").text("ADDRESS:", 48, startY + 58);
  doc.font("Helvetica").text(clientAddr, 115, startY + 58, { width: 170 });

  // Ship To Content
  doc.font("Helvetica-Bold").fillColor(charcoal);
  doc.text("CLIENT NAME:", 311, startY + 25);
  doc.font("Helvetica-Bold").text(shipName.toUpperCase(), 380, startY + 25, { width: 170 });

  doc.font("Helvetica-Bold").text("CONTACT NO:", 311, startY + 36);
  doc.font("Helvetica").text(shipPhone, 380, startY + 36);

  doc.font("Helvetica-Bold").text("EMAIL:", 311, startY + 47);
  doc.font("Helvetica").text(shipEmail, 380, startY + 47);

  doc.font("Helvetica-Bold").text("ADDRESS:", 311, startY + 58);
  doc.font("Helvetica").text(shipAddr, 380, startY + 58, { width: 170 });

  // 4. Section 3: BOQ / INVOICE ITEMS TABLE
  startY += 83;

  // Default Items if empty
  const rawItems = (invoice.items && invoice.items.length > 0)
    ? invoice.items
    : [
        { productName: "Queen Size Bed, With Cush", hsnSac: "995476", quantity: 1, unit: "Unit", rate: 36000, total: 36000 },
        { productName: "King Size Bed Hydrolic", hsnSac: "995476", quantity: 1, unit: "Unit", rate: 64000, total: 64000 },
        { productName: "Openable Wardrobe 1", hsnSac: "995476", quantity: 1, unit: "Unit", rate: 55000, total: 55000 },
        { productName: "Openable Wardrobe 2, Study", hsnSac: "995476", quantity: 1, unit: "Unit", rate: 71400, total: 71400 },
        { productName: "Openable Wardrobe 3, Study", hsnSac: "995476", quantity: 1, unit: "Unit", rate: 40800, total: 40800 },
        { productName: "Study Table", hsnSac: "995476", quantity: 1, unit: "Unit", rate: 67200, total: 67200 },
        { productName: "Side Table", hsnSac: "995476", quantity: 4, unit: "Unit", rate: 5500, total: 22000 },
        { productName: "TV Unit & Console", hsnSac: "995476", quantity: 1, unit: "Unit", rate: 112400, total: 112400 }
      ];

  const renderTableHeader = (currY) => {
    doc.rect(40, currY, 515, 18).fill(darkNavy);
    doc.fillColor("#FFFFFF").fontSize(7.5).font("Helvetica-Bold");
    doc.text("#", 45, currY + 5, { width: 20, align: "center" });
    doc.text("Product / Scope Description", 70, currY + 5, { width: 175 });
    doc.text("HSN/SAC", 250, currY + 5, { width: 45, align: "center" });
    doc.text("Qty", 300, currY + 5, { width: 25, align: "center" });
    doc.text("Unit", 330, currY + 5, { width: 30, align: "center" });
    doc.text("Rate (Rs.)", 365, currY + 5, { width: 55, align: "right" });
    doc.text("GST %", 425, currY + 5, { width: 35, align: "center" });
    doc.text("Total (Rs.)", 465, currY + 5, { width: 80, align: "right" });
  };

  renderTableHeader(startY);
  let tableY = startY + 18;

  rawItems.forEach((it, idx) => {
    if (tableY > 710) {
      doc.addPage();
      // Re-render header bar on new page
      doc.rect(40, 35, 515, 30).fill(darkNavy);
      doc.fillColor(gold).fontSize(12).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 52, 43);
      doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold").text(`TAX INVOICE (${invNum}) - Contd.`, 390, 43, { align: "right" });
      tableY = 75;
      renderTableHeader(tableY);
      tableY += 18;
    }

    const rowBg = idx % 2 === 0 ? "#FFFFFF" : lightGrey;
    doc.rect(40, tableY, 515, 16).fill(rowBg);
    doc.strokeColor(borderGrey).lineWidth(0.5).rect(40, tableY, 515, 16).stroke();

    const name = it.productName || it.description || "Turnkey Interior Component";
    const hsn = it.hsnSac || "995476";
    const qty = it.quantity || 1;
    const unit = it.unit || "Unit";
    const rate = Number(it.rate) || 0;
    const gstPct = Number(it.gstPercent) || 0;
    const total = Number(it.total) || (rate * qty);

    doc.fillColor(charcoal).fontSize(7.5).font("Helvetica");
    doc.text(String(idx + 1), 45, tableY + 4, { width: 20, align: "center" });
    doc.font("Helvetica-Bold").text(name, 70, tableY + 4, { width: 175 });
    doc.font("Helvetica").fillColor(slate).text(hsn, 250, tableY + 4, { width: 45, align: "center" });
    doc.fillColor(charcoal).text(String(qty), 300, tableY + 4, { width: 25, align: "center" });
    doc.text(unit, 330, tableY + 4, { width: 30, align: "center" });
    doc.text(`Rs. ${Math.round(rate).toLocaleString("en-IN")}`, 365, tableY + 4, { width: 55, align: "right" });
    doc.text(`${gstPct}%`, 425, tableY + 4, { width: 35, align: "center" });
    doc.font("Helvetica-Bold").text(`Rs. ${Math.round(total).toLocaleString("en-IN")}`, 465, tableY + 4, { width: 80, align: "right" });

    tableY += 16;
  });

  // 5. Commercial Summary & Bank Details
  if (tableY > 640) {
    doc.addPage();
    tableY = 50;
  }

  tableY += 10;

  // Left Side: Bank Details Card
  const bankCardY = tableY;
  doc.rect(40, bankCardY, 260, 95).fill(lightGrey);
  doc.strokeColor(borderGrey).lineWidth(0.75).rect(40, bankCardY, 260, 95).stroke();

  doc.fillColor(darkNavy).fontSize(8.5).font("Helvetica-Bold").text("BANK DETAILS & PAYMENT TERMS", 50, bankCardY + 10);
  doc.fillColor(charcoal).fontSize(7.5).font("Helvetica");
  doc.text("Account Holder: VELORA LUXURY INTERIORS", 50, bankCardY + 26);
  doc.text("Account Number: 50200073374185", 50, bankCardY + 38);
  doc.text("Bank & Branch: HDFC Bank, Wakad Branch", 50, bankCardY + 50);
  doc.text("IFSC Code: HDFC0000123", 50, bankCardY + 62);
  doc.text("UPI ID: velora@hdfcbank", 50, bankCardY + 74);

  // Right Side: Commercial Totals Summary
  const totalsCardY = tableY;
  const grandTotal = Number(invoice.grandTotal) || rawItems.reduce((acc, i) => acc + (Number(i.total) || 0), 0) || 468800;
  const subtotal = Number(invoice.subtotal) || grandTotal;
  const gstTotal = Number(invoice.gstTotal) || 0;
  const paidAmount = Number(invoice.paidAmount) || 0;
  const balanceDue = Number(invoice.balanceDue) || (grandTotal - paidAmount);

  doc.rect(310, totalsCardY, 245, 95).fill("#F1F5F9");
  doc.strokeColor(darkGold).lineWidth(1).rect(310, totalsCardY, 245, 95).stroke();

  doc.fillColor(charcoal).fontSize(8).font("Helvetica");
  doc.text("Sub Total (Excl. Tax):", 320, totalsCardY + 10);
  doc.font("Helvetica-Bold").text(`Rs. ${Math.round(subtotal).toLocaleString("en-IN")}`, 440, totalsCardY + 10, { align: "right" });

  doc.font("Helvetica").text("CGST (9%):", 320, totalsCardY + 24);
  doc.font("Helvetica-Bold").text(`Rs. ${Math.round(gstTotal / 2).toLocaleString("en-IN")}`, 440, totalsCardY + 24, { align: "right" });

  doc.font("Helvetica").text("SGST (9%):", 320, totalsCardY + 38);
  doc.font("Helvetica-Bold").text(`Rs. ${Math.round(gstTotal / 2).toLocaleString("en-IN")}`, 440, totalsCardY + 38, { align: "right" });

  doc.strokeColor(borderGrey).lineWidth(0.5).moveTo(320, totalsCardY + 52).lineTo(545, totalsCardY + 52).stroke();

  doc.rect(310, totalsCardY + 54, 245, 22).fill(darkNavy);
  doc.fillColor(gold).fontSize(9.5).font("Helvetica-Bold").text("GRAND TOTAL:", 320, totalsCardY + 60);
  doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold").text(`Rs. ${Math.round(grandTotal).toLocaleString("en-IN")}`, 440, totalsCardY + 60, { align: "right" });

  doc.fillColor(charcoal).fontSize(7.5).font("Helvetica");
  doc.text("Amount Paid:", 320, totalsCardY + 80);
  doc.font("Helvetica-Bold").text(`Rs. ${Math.round(paidAmount).toLocaleString("en-IN")}`, 380, totalsCardY + 80);

  doc.font("Helvetica").text("Balance Due:", 440, totalsCardY + 80);
  doc.font("Helvetica-Bold").fillColor(darkGold).text(`Rs. ${Math.round(balanceDue).toLocaleString("en-IN")}`, 485, totalsCardY + 80, { align: "right" });

  // 6. Signatory & Footer
  const footerY = totalsCardY + 108;

  doc.fillColor(slate).fontSize(7).font("Helvetica-Bold").text("TERMS & CONDITIONS:", 40, footerY);
  doc.font("Helvetica").fontSize(6.5).fillColor(slate);
  doc.text("1. All items are turnkey supply and installation specifications.", 40, footerY + 10);
  doc.text("2. Payment schedules strictly map to project sign-off milestones.", 40, footerY + 18);
  doc.text("3. Subject to Pune, Maharashtra jurisdiction only.", 40, footerY + 26);

  // Authorized Signatory Stamp Box Right
  doc.strokeColor(borderGrey).rect(400, footerY, 155, 38).stroke();
  doc.fillColor(darkNavy).fontSize(7.5).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 405, footerY + 5, { width: 145, align: "center" });
  doc.fillColor(slate).fontSize(6.5).font("Helvetica-Oblique").text("Authorized Signatory Stamp", 405, footerY + 24, { width: 145, align: "center" });

  doc.fontSize(7).fillColor("#94A3B8").font("Helvetica-Oblique").text("This is an electronically generated official Tax Invoice issued by Velora CRM ERP.", 40, footerY + 45, { align: "center" });

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
