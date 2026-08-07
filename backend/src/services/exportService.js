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
  doc.fillColor(charcoal).fontSize(14).font("Helvetica-Bold").text(`ESTIMATE & BILL OF QUANTITIES`, { align: "left" });
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
  doc.text(`BOQ Ref: ${boq.boqNumber}`, 320, metaY + 12);
  doc.text(`Date: ${new Date(boq.createdAt || Date.now()).toLocaleDateString("en-IN")}`, 320, metaY + 24);
  doc.text(`Prepared By: ${boq.preparedBy || "Design Team"}`, 320, metaY + 36);
  doc.text(`Status: ${boq.status || "Draft"}`, 320, metaY + 48);

  doc.x = 50; // Reset X position
  doc.y = metaY + 105;
  doc.moveDown(1);

  // Rooms and Items table
  if (boq.rooms && boq.rooms.length > 0) {
    boq.rooms.forEach((room) => {
      // Room Header
      if (doc.y > 680) {
        doc.addPage();
        doc.fillColor(darkGold).fontSize(14).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 50, 40);
        doc.strokeColor(gold).lineWidth(1).moveTo(50, 58).lineTo(545, 58).stroke();
        doc.y = 70;
      }
      doc.fillColor(darkGold).fontSize(12).font("Helvetica-Bold").text(room.name, { underline: true });
      doc.moveDown(0.4);

      // Table Header
      const headerY = doc.y;
      doc.fillColor(slate).fontSize(8).font("Helvetica-Bold");
      doc.text("Item Details", 50, headerY, { width: 180 });
      doc.text("Material / Brand", 230, headerY, { width: 140 });
      doc.text("Qty", 370, headerY, { width: 30, align: "right" });
      doc.text("Unit", 400, headerY, { width: 35, align: "center" });
      doc.text("Rate (₹)", 440, headerY, { width: 50, align: "right" });
      doc.text("Total (₹)", 495, headerY, { width: 50, align: "right" });

      doc.moveDown(0.2);
      doc.strokeColor(lightGrey).lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);

      // Room Items
      if (room.items && room.items.length > 0) {
        room.items.forEach((item) => {
          // Check page break
          if (doc.y > 720) {
            doc.addPage();
            // Re-draw header banner minimal
            doc.fillColor(darkGold).fontSize(14).font("Helvetica-Bold").text("VELORA LUXURY INTERIORS", 50, 40);
            doc.strokeColor(gold).lineWidth(1).moveTo(50, 58).lineTo(545, 58).stroke();
            doc.y = 70;
          }

          const itemY = doc.y;
          doc.fillColor(charcoal).fontSize(8).font("Helvetica");
          doc.text(item.itemName, 50, itemY, { width: 175 });
          doc.fillColor(slate).text(item.material || "Standard", 230, itemY, { width: 135 });
          doc.fillColor(charcoal).text(item.quantity.toString(), 370, itemY, { width: 30, align: "right" });
          doc.text(item.unit || "unit", 400, itemY, { width: 35, align: "center" });
          doc.text(Math.round(item.price).toLocaleString("en-IN"), 440, itemY, { width: 50, align: "right" });
          
          const lineVal = item.quantity * item.price;
          const lineTotal = lineVal + (lineVal * (item.gstPercent || 18) / 100);
          doc.text(Math.round(lineTotal).toLocaleString("en-IN"), 495, itemY, { width: 50, align: "right" });

          doc.moveDown(0.5);
        });
      }

      doc.moveDown(0.3);
      doc.strokeColor(gold).lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      
      // Room Subtotal
      const subtotalY = doc.y;
      doc.fillColor(darkGold).fontSize(9).font("Helvetica-Bold");
      doc.text(`${room.name} Subtotal (incl. GST):`, 300, subtotalY, { width: 190, align: "right" });
      const roomSub = room.items.reduce((sum, item) => {
        const lineVal = item.quantity * item.price;
        return sum + lineVal + (lineVal * (item.gstPercent || 18) / 100);
      }, 0);
      doc.text(`₹${Math.round(roomSub).toLocaleString("en-IN")}`, 495, subtotalY, { width: 50, align: "right" });

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

  doc.fillColor(charcoal).fontSize(10).font("Helvetica-Bold").text("ESTIMATE SUMMARY", 65, summaryY + 12);
  doc.fontSize(9).font("Helvetica").fillColor(charcoal);
  doc.text(`Subtotal (Excl. GST):`, 65, summaryY + 30);
  doc.text(`₹${Math.round(boq.subtotal).toLocaleString("en-IN")}`, 200, summaryY + 30);

  doc.text(`Estimated GST (18%):`, 65, summaryY + 45);
  doc.text(`₹${Math.round(boq.gstTotal).toLocaleString("en-IN")}`, 200, summaryY + 45);

  doc.fontSize(11).font("Helvetica-Bold").fillColor(darkGold);
  doc.text(`GRAND TOTAL:`, 65, summaryY + 60);
  doc.text(`₹${Math.round(boq.grandTotal).toLocaleString("en-IN")}`, 200, summaryY + 60);

  // Terms and conditions
  doc.y = summaryY + 95;
  doc.fillColor(charcoal).fontSize(10).font("Helvetica-Bold").text("TERMS & CONDITIONS");
  doc.fontSize(8).font("Helvetica").fillColor(slate);
  doc.moveDown(0.4);
  doc.text("1. Payments: 50% advance to confirm order; 40% on production commencement; 10% post installation.");
  doc.text("2. Quotation is valid for 30 days and based on initial site inputs. Final billing depends on actual dimensions.");
  doc.text("3. Delivery Timeline: 45 working days from sign-off of 2D/3D layouts and material selection.");
  doc.text("4. Any changes or additions to this scope will be charged extra as per actual costs.");

  doc.moveDown(2);
  doc.fontSize(8).fillColor("#999999").text("This is an electronically generated estimate and does not require a physical signature.", { align: "center" });

  doc.end();
};
