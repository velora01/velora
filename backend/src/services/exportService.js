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
