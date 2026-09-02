import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import erpApi from "../services/erpService";
import {
  DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE,
  calculateMilestones,
  getActiveTermsTemplate
} from "../constants/termsAndConditionsTemplates";

/**
 * Triggers native browser download from a Blob
 */
export const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 1000);
};

/**
 * Loads an image URL into a base64 Data URL with fallback handling
 */
export const loadImageDataUrl = (url) => {
  return new Promise((resolve) => {
    if (!url || typeof url !== "string") return resolve(null);
    if (url.startsWith("data:image")) return resolve(url);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 120;
        canvas.height = img.naturalHeight || img.height || 120;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

/**
 * Client-Side Luxury BOQ / Estimate PDF Generator Matching User Images
 * (Image 1 Table Structure with Ref. Images + Image 2 Velora Antaraal Theme, Totals & T&C)
 */
export const generateClientSideBOQPdf = async (boq, options = {}) => {
  const includeTerms = options.includeTerms !== false;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  const boqNum = boq?.boqNumber || boq?.enquiryNo || "BOQ-ESTIMATE";
  const clientName = boq?.clientName || "Valued Client";
  const clientPhone = boq?.clientPhone || "";
  const siteLocation = boq?.siteLocation || boq?.siteAddress || "Wakad, Pune";
  const issueDate = boq?.enquiryDate || boq?.createdAt || Date.now();
  const formattedDate = new Date(issueDate).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });

  const spaces = (boq?.spaces && boq.spaces.length > 0) ? boq.spaces : [{ name: "Living Room", roomTotal: 0, items: [] }];

  let spacesSubtotal = 0;
  spaces.forEach((sp) => {
    let sSum = 0;
    (sp.items || []).forEach((it) => {
      sSum += Number(it.amount || ((Number(it.rate) || 0) * (Number(it.sqft) || Number(it.qty) || 1)));
    });
    if (sSum === 0 && sp.roomTotal) sSum = Number(sp.roomTotal);
    spacesSubtotal += sSum;
  });

  const discountType = boq?.discountType || "amount";
  const discountValue = Number(boq?.discountValue || 0);
  const discountAmount = Number(boq?.discountAmount) || (discountType === "percent" ? Math.round(spacesSubtotal * (discountValue / 100)) : Math.min(spacesSubtotal, Math.round(discountValue)));
  const taxableAmount = Math.max(0, spacesSubtotal - discountAmount);
  const gstPercent = boq?.gstPercent !== undefined ? Number(boq.gstPercent) : 18;
  const cgstAmount = Math.round(taxableAmount * (gstPercent / 200));
  const sgstAmount = Math.round(taxableAmount * (gstPercent / 200));
  const gstTotal = cgstAmount + sgstAmount;
  const grandTotal = Number(boq?.grandTotal) || (taxableAmount + gstTotal);

  // Pre-load all line item images into base64
  for (const space of spaces) {
    for (const item of (space.items || [])) {
      const imgUrl = (item.photos && item.photos[0]?.url) || item.image || item.photos?.[0] || "";
      if (imgUrl && !item._base64) {
        item._base64 = await loadImageDataUrl(imgUrl);
      }
    }
  }

  // Header Left: Prepared For matching Image 1
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 113, 108);
  doc.text("Prepared for", 40, 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(28, 25, 23);
  doc.text(clientName, 40, 58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(87, 83, 78);
  doc.text(`Project: ${siteLocation}`, 40, 72);
  if (clientPhone) doc.text(`Phone: ${clientPhone}`, 40, 84);
  doc.text(formattedDate, 40, clientPhone ? 96 : 84);

  // Header Right: Velora Antaraal Branding matching Image 2
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(158, 123, 29); // Dark gold
  doc.text("VELORA ANTARAAL", 555, 42, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 113, 108);
  doc.text("INTERIOR DESIGN | DÉCOR | RETAIL", 555, 54, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(87, 83, 78);
  doc.text("Shop No.242/2/B1, Bafna Niwas, Aundh Hinjewadi Road,", 555, 66, { align: "right" });
  doc.text("Wakad, Pune-411057, Maharashtra", 555, 77, { align: "right" });
  doc.text("+91 86055 26603 / 9284664507", 555, 88, { align: "right" });
  doc.text("info@velora.family | https://velora.family", 555, 99, { align: "right" });

  // Center Red/Maroon ESTIMATE Title matching Image 1 & 2
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(168, 50, 50); // Maroon from Image 1
  doc.text("INTERIOR ESTIMATE & QUOTATION", 297.5, 122, { align: "center" });

  doc.setDrawColor(234, 227, 210);
  doc.setLineWidth(0.75);
  doc.line(40, 130, 555, 130);

  let currentY = 140;

  // Space-by-Space Tables matching Image 1
  spaces.forEach((space) => {
    if (currentY > 660) {
      doc.addPage();
      currentY = 40;
    }

    // Space Banner Bar (e.g. LIVING ROOM in maroon / bronze)
    doc.setFillColor(254, 242, 242);
    doc.rect(40, currentY, 515, 26, "F");
    doc.setDrawColor(168, 50, 50);
    doc.rect(40, currentY, 515, 26, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(168, 50, 50);
    doc.text(space.name.toUpperCase(), 48, currentY + 18);

    const spaceItems = (space.items && space.items.length > 0) ? space.items : [
      { name: `${space.name} Scope Execution`, typeVariant: "Turnkey", qty: 1, rate: space.roomTotal || 0, amount: space.roomTotal || 0, sqft: 1 }
    ];

    const tableRows = spaceItems.map((item, idx) => {
      const name = item.name || "Interior Component";
      const spaceCategory = `${space.name.toUpperCase()} > ${space.name.toUpperCase()} - Category: ${item.typeVariant || "Wood Work"}, Sub Category: ${item.packageVariant || "Standard"}`;
      const description = item.description || `Providing and Installation ${item.name}, made in 18 mm thk Hardcore Triple A grade Okuma face Commercial plywood`;
      const dims = (item.lengthFt || item.heightFt)
        ? `Dimension 1: ${item.lengthFt || 0}ft ${item.lengthIn ? `${item.lengthIn}in` : ""}\nDimension 2: ${item.heightFt || 0}ft ${item.heightIn ? `${item.heightIn}in` : ""}${item.depthFt ? `\nDepth: ${item.depthFt}ft` : ""}`
        : "-";
      const hardware = `Hardware (Channels, fittings): Onyx / Ebco`;

      const fullDesc = `${name}\n\n${spaceCategory}\n${description}\n${hardware}\n${dims}`;

      const uom = item.uom || item.unit || "Sq. Ft";
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 1;
      const amount = Number(item.amount) || (rate * (Number(item.sqft) || qty));

      return [
        String(idx + 1),
        fullDesc,
        { content: "", img: item._base64 },
        uom,
        `Rs. ${rate.toLocaleString("en-IN")}`,
        String(qty),
        `Rs. ${amount.toLocaleString("en-IN")}`
      ];
    });

    autoTable(doc, {
      startY: currentY + 26,
      margin: { left: 40, right: 40 },
      head: [["SN", "Item Description & Specification", "Image", "UOM", "Unit Rate", "Qty", "Price"]],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [250, 246, 237],
        textColor: [28, 25, 23],
        fontSize: 10,
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [200, 200, 200],
        cellPadding: 6
      },
      bodyStyles: {
        fontSize: 9.5,
        textColor: [25, 25, 25],
        lineColor: [215, 215, 215],
        lineWidth: 0.5,
        valign: "middle",
        cellPadding: 6
      },
      columnStyles: {
        0: { cellWidth: 26, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 224 },
        2: { cellWidth: 68, halign: "center" },
        3: { cellWidth: 38, halign: "center", fontStyle: "bold" },
        4: { cellWidth: 58, halign: "right", fontStyle: "bold" },
        5: { cellWidth: 26, halign: "center", fontStyle: "bold" },
        6: { cellWidth: 75, halign: "right", fontStyle: "bold" }
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 2 && data.cell.raw?.img) {
          try {
            const pad = 4;
            const size = Math.min(data.cell.width - (pad * 2), data.cell.height - (pad * 2), 60);
            const x = data.cell.x + (data.cell.width - size) / 2;
            const y = data.cell.y + (data.cell.height - size) / 2;
            doc.addImage(data.cell.raw.img, "JPEG", x, y, size, size);
          } catch (e) {
            // fallback
          }
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 18;
  });

  // Area-by-Area Summary Table Matching Reference Image 4 & 5
  if (currentY > 580) {
    doc.addPage();
    currentY = 40;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(168, 50, 50); // Maroon
  doc.text("Summary", 40, currentY + 12);
  currentY += 18;

  const summaryRows = spaces.map((sp, idx) => {
    let sSum = 0;
    (sp.items || []).forEach((it) => {
      sSum += Number(it.amount || ((Number(it.rate) || 0) * (Number(it.sqft) || Number(it.qty) || 1)));
    });
    if (sSum === 0 && sp.roomTotal) sSum = Number(sp.roomTotal);
    const qtyCount = (sp.items && sp.items.length > 0) ? sp.items.length : 1;
    return [
      String(idx + 1),
      sp.name.toUpperCase(),
      String(qtyCount),
      `Rs. ${sSum.toLocaleString("en-IN")}`
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: 40, right: 40 },
    head: [["SN", "Area", "Quantity", "Total Amount"]],
    body: summaryRows,
    theme: "grid",
    headStyles: {
      fillColor: [250, 246, 237],
      textColor: [28, 25, 23],
      fontSize: 10,
      fontStyle: "bold",
      lineWidth: 0.5,
      lineColor: [200, 200, 200],
      cellPadding: 6
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: [25, 25, 25],
      lineColor: [215, 215, 215],
      lineWidth: 0.5,
      valign: "middle",
      cellPadding: 6
    },
    columnStyles: {
      0: { cellWidth: 35, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 260, fontStyle: "bold" },
      2: { cellWidth: 80, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 140, halign: "right", fontStyle: "bold" }
    }
  });

  currentY = doc.lastAutoTable.finalY + 16;

  // Commercial Totals Box with PROPER LARGE TEXT matching Image 5
  if (currentY > 660) {
    doc.addPage();
    currentY = 40;
  }

  const totalsBoxX = 265;
  const totalsBoxW = 290;
  let totY = currentY;

  // Subtotal row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text("Total", totalsBoxX + 10, totY + 14);
  doc.text(`Rs. ${spacesSubtotal.toLocaleString("en-IN")}`, totalsBoxX + totalsBoxW - 10, totY + 14, { align: "right" });
  totY += 22;

  // Discount row (if any)
  if (discountAmount > 0) {
    doc.setTextColor(180, 40, 40);
    doc.text("Discount", totalsBoxX + 10, totY + 14);
    doc.text(`- Rs. ${discountAmount.toLocaleString("en-IN")}`, totalsBoxX + totalsBoxW - 10, totY + 14, { align: "right" });
    totY += 22;
  }

  // GST row (if applicable)
  if (gstTotal > 0) {
    doc.setTextColor(70, 70, 70);
    doc.text(`GST (${gstPercent}%)`, totalsBoxX + 10, totY + 14);
    doc.text(`Rs. ${gstTotal.toLocaleString("en-IN")}`, totalsBoxX + totalsBoxW - 10, totY + 14, { align: "right" });
    totY += 22;
  }

  // Grand Total Box - High impact large text
  doc.setFillColor(250, 246, 237);
  doc.rect(totalsBoxX, totY, totalsBoxW, 36, "FD");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.rect(totalsBoxX, totY, totalsBoxW, 36, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(158, 123, 29);
  doc.text("Grand Total", totalsBoxX + 10, totY + 23);
  doc.setFontSize(16);
  doc.text(`Rs. ${grandTotal.toLocaleString("en-IN")}`, totalsBoxX + totalsBoxW - 10, totY + 23, { align: "right" });

  totY += 46;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(numberToWordsIN(grandTotal), totalsBoxX + totalsBoxW, totY, { align: "right" });
  currentY = totY + 20;

  // Render Signatures if terms are not included on separate page
  if (!includeTerms) {
    if (currentY > 730) {
      doc.addPage();
      currentY = 40;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("Client Signature: _______________________", 40, currentY + 16);

    doc.setFont("helvetica", "bold");
    doc.text("For VELORA ANTARAAL", 555, currentY + 16, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", 555, currentY + 38, { align: "right" });

    doc.setDrawColor(212, 175, 55);
    doc.line(40, 788, 555, 788);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(158, 123, 29);
    doc.text("SPACES WITHIN, DESIGNED BEAUTIFULLY", 297.5, 802, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text("+91 86055 26603 | +91 820-8732741  •  info@velora.family  •  https://velora.family  •  Wakad, Pune, Maharashtra", 297.5, 814, { align: "center" });

    doc.save(`${boqNum}.pdf`);
    return;
  }

  // =========================================================================
  // DEDICATED TERMS & CONDITIONS PAGES (Matching Image 5 & 6)
  // Starts CLEANLY on a brand new page!
  // =========================================================================
  doc.addPage();
  currentY = 40;

  const tcTemplate = getActiveTermsTemplate();

  // 1. Payment Plan Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(168, 50, 50); // Maroon
  doc.text("Payment Plan", 40, currentY + 10);

  const milestones = calculateMilestones(grandTotal, tcTemplate.paymentPlan);
  const paymentRows = milestones.map((m) => [
    m.milestone,
    `${m.percent}%`,
    `Rs. ${m.amount.toLocaleString("en-IN")}`
  ]);

  autoTable(doc, {
    startY: currentY + 18,
    margin: { left: 40, right: 40 },
    head: [["Milestone", "Percent", "Amount"]],
    body: paymentRows,
    theme: "grid",
    headStyles: {
      fillColor: [250, 246, 237],
      textColor: [28, 25, 23],
      fontSize: 9.5,
      fontStyle: "bold",
      lineWidth: 0.5,
      lineColor: [200, 200, 200],
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [40, 40, 40],
      lineColor: [215, 215, 215],
      lineWidth: 0.5,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 260 },
      1: { cellWidth: 90, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 165, halign: "right", fontStyle: "bold" }
    }
  });

  currentY = doc.lastAutoTable.finalY + 16;

  // 2. Bank Account Details
  doc.setDrawColor(168, 50, 50);
  doc.setLineWidth(3);
  doc.line(40, currentY, 40, currentY + 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(168, 50, 50);
  doc.text("Bank Account Details", 48, currentY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(28, 25, 23);
  doc.text(`Account Holder: ${tcTemplate.bankDetails.accountHolder}`, 48, currentY + 24);
  doc.text(`Account Number: ${tcTemplate.bankDetails.accountNumber}`, 48, currentY + 34);
  doc.text(`IFSC: ${tcTemplate.bankDetails.ifsc}`, 48, currentY + 44);
  doc.text(`Branch: ${tcTemplate.bankDetails.branch}    |    Account Type: ${tcTemplate.bankDetails.accountType}`, 48, currentY + 54);

  currentY += 68;

  // 3. Terms and Conditions (16 Points matching PDF)
  doc.setDrawColor(168, 50, 50);
  doc.setLineWidth(3);
  doc.line(40, currentY, 40, currentY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(168, 50, 50);
  doc.text("Terms and Conditions", 48, currentY + 12);
  currentY += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  tcTemplate.termsList.forEach((item, idx) => {
    if (currentY > 780) {
      doc.addPage();
      currentY = 40;
    }
    const fullText = `${idx + 1}. ${item.title ? `${item.title}: ` : ""}${item.text}`;
    const lines = doc.splitTextToSize(fullText, 515);
    doc.text(lines, 40, currentY);
    currentY += (lines.length * 9.5) + 3;
  });

  // Note
  if (currentY > 770) {
    doc.addPage();
    currentY = 40;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(28, 25, 23);
  doc.text(tcTemplate.note || "Note : Debris removal / Deep cleaning charges shall be charged at actuals.( Borne by the client )", 40, currentY + 4);
  currentY += 18;

  // 4. Material Details
  if (currentY > 700) {
    doc.addPage();
    currentY = 40;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(168, 50, 50);
  doc.text("Material Details:", 40, currentY);
  currentY += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  tcTemplate.materialDetails.forEach((mat, mIdx) => {
    if (currentY > 780) {
      doc.addPage();
      currentY = 40;
    }
    const fullText = `${mIdx + 1}. ${mat.title}: ${mat.text}`;
    const lines = doc.splitTextToSize(fullText, 515);
    doc.text(lines, 40, currentY);
    currentY += (lines.length * 9.5) + 2;
  });

  // 5. Warranty Details
  if (currentY > 660) {
    doc.addPage();
    currentY = 40;
  }
  currentY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(168, 50, 50);
  doc.text("WARRANTY Details:", 40, currentY);
  currentY += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  tcTemplate.warrantyDetails.forEach((wText, wIdx) => {
    if (currentY > 780) {
      doc.addPage();
      currentY = 40;
    }
    const fullText = `${wIdx + 1}. ${wText}`;
    const lines = doc.splitTextToSize(fullText, 515);
    doc.text(lines, 40, currentY);
    currentY += (lines.length * 9.5) + 2;
  });

  // 6. Signatures and Footer
  if (currentY > 730) {
    doc.addPage();
    currentY = 40;
  } else {
    currentY += 14;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("Client Signature: _______________________", 40, currentY + 16);

  doc.setFont("helvetica", "bold");
  doc.text("For VELORA ANTARAAL", 555, currentY + 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signatory", 555, currentY + 38, { align: "right" });

  doc.setDrawColor(212, 175, 55);
  doc.line(40, 788, 555, 788);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(158, 123, 29);
  doc.text("SPACES WITHIN, DESIGNED BEAUTIFULLY", 297.5, 802, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("+91 86055 26603 | +91 820-8732741  •  info@velora.family  •  https://velora.family  •  Wakad, Pune, Maharashtra", 297.5, 814, { align: "center" });

  doc.save(`${boqNum}.pdf`);
};

/**
 * Universal Download Function for BOQ / Quotation PDF
 */
export const downloadBOQPdf = async (boqOrId, customFilename, options = {}) => {
  const id = typeof boqOrId === "object" ? (boqOrId?._id || boqOrId?.boqNumber) : boqOrId;
  const filename = customFilename || (typeof boqOrId === "object" ? `${boqOrId?.boqNumber || "Quotation"}.pdf` : `Quotation_${id}.pdf`);

  // Instant client-side generation if full BOQ object is passed
  if (typeof boqOrId === "object" && (boqOrId.clientName || boqOrId.spaces || boqOrId.boqNumber)) {
    try {
      await generateClientSideBOQPdf(boqOrId, options);
      return;
    } catch (err) {
      console.warn("Client side BOQ PDF error, trying backend:", err);
    }
  }

  // Try backend PDF endpoint with Blob
  try {
    const token = localStorage.getItem("velora_admin_token") || localStorage.getItem("velora_token") || "";
    const backendUrl = erpApi.exportBOQPdfUrl(id);

    const res = await fetch(backendUrl + (token ? `?token=${encodeURIComponent(token)}` : ""), {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, filename);
      return;
    }
  } catch (err) {
    console.warn("Backend PDF download failed, using client-side generator:", err);
  }

  // Fallback: Generate Client-side PDF immediately
  const boqData = typeof boqOrId === "object" ? boqOrId : { boqNumber: String(id), clientName: "Valued Client", grandTotal: 3964567 };
  await generateClientSideBOQPdf(boqData, options);
};

/**
 * Direct High-Resolution Print / Save as PDF Function Matching Image 1 & 2
 */
export const printBOQQuotation = (boq, options = {}) => {
  if (!boq) return;

  const includeTerms = options.includeTerms !== false;
  const clientName = boq.clientName || "Valued Client";
  const clientPhone = boq.clientPhone || "-";
  const clientEmail = boq.clientEmail || "-";
  const siteLocation = boq.siteLocation || boq.siteAddress || "Wakad, Pune";
  const boqNumber = boq.boqNumber || boq.enquiryNo || "BOQ-ESTIMATE";
  const formattedDate = new Date(boq.enquiryDate || boq.createdAt || Date.now()).toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });

  const spaces = boq.spaces && boq.spaces.length > 0 ? boq.spaces : [{ name: "Living Room", roomTotal: 0, items: [] }];

  let spacesSubtotal = 0;
  spaces.forEach((sp) => {
    let sSum = 0;
    (sp.items || []).forEach((it) => {
      sSum += Number(it.amount || ((Number(it.rate) || 0) * (Number(it.sqft) || Number(it.qty) || 1)));
    });
    if (sSum === 0 && sp.roomTotal) sSum = Number(sp.roomTotal);
    spacesSubtotal += sSum;
  });

  const discountType = boq.discountType || "amount";
  const discountValue = Number(boq.discountValue || 0);
  const discountAmount = Number(boq.discountAmount) || (discountType === "percent" ? Math.round(spacesSubtotal * (discountValue / 100)) : Math.min(spacesSubtotal, Math.round(discountValue)));
  const taxableAmount = Math.max(0, spacesSubtotal - discountAmount);
  const gstPercent = boq.gstPercent !== undefined ? Number(boq.gstPercent) : 18;
  const cgstAmount = Math.round(taxableAmount * (gstPercent / 200));
  const sgstAmount = Math.round(taxableAmount * (gstPercent / 200));
  const gstTotal = cgstAmount + sgstAmount;
  const grandTotal = Number(boq.grandTotal) || (taxableAmount + gstTotal);

  const tcTemplate = getActiveTermsTemplate();
  const milestones = calculateMilestones(grandTotal, tcTemplate.paymentPlan);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print / save as PDF.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Estimate_${boqNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
    @page {
      size: A4;
      margin: 8mm 10mm;
    }
    body {
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1c1917;
      margin: 0;
      padding: 0;
      font-size: 14px;
      line-height: 1.5;
      background: #fff;
      -webkit-font-smoothing: antialiased;
    }
    .page-container {
      max-width: 920px;
      margin: 0 auto;
      padding: 16px;
      box-sizing: border-box;
      border: 1px solid #e7e5e4;
      position: relative;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 1px solid #e7e5e4;
    }
    .client-box h4 {
      margin: 0 0 3px 0;
      font-size: 12px;
      color: #78716c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .client-box h2 {
      margin: 0 0 5px 0;
      font-size: 22px;
      font-weight: 900;
      color: #0c0a09;
    }
    .client-box p {
      margin: 3px 0;
      font-size: 13.5px;
      color: #44403c;
      font-weight: 500;
    }
    .brand-box {
      text-align: right;
    }
    .brand-box h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      color: #9e7b1d;
      letter-spacing: 0.5px;
    }
    .brand-box .tagline {
      font-size: 11px;
      font-weight: 800;
      color: #78716c;
      letter-spacing: 1px;
      margin: 2px 0 4px 0;
    }
    .brand-box p {
      margin: 1px 0;
      font-size: 12.5px;
      color: #57534e;
    }
    .title-banner {
      text-align: center;
      margin: 16px 0 20px 0;
    }
    .title-banner h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      color: #a83232;
      letter-spacing: 1.5px;
    }
    .space-block {
      margin-bottom: 22px;
      break-inside: avoid;
    }
    .space-title-bar {
      background: #fef2f2;
      border: 2px solid #a83232;
      color: #a83232;
      font-size: 16px;
      font-weight: 900;
      padding: 10px 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 6px 6px 0 0;
    }
    table.item-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d6d3d1;
      border-top: none;
      font-size: 13.5px;
    }
    table.item-table th {
      background: #fafaf9;
      border: 1px solid #d6d3d1;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 800;
      text-align: center;
      color: #1c1917;
    }
    table.item-table td {
      border: 1px solid #e7e5e4;
      padding: 10px 12px;
      vertical-align: middle;
      color: #1c1917;
    }
    .item-name {
      font-weight: 900;
      font-size: 16px;
      color: #0c0a09;
      margin-bottom: 4px;
    }
    .item-cat {
      font-size: 12px;
      font-weight: 700;
      color: #78716c;
      margin-bottom: 4px;
    }
    .item-desc {
      font-size: 13.5px;
      color: #292524;
      margin-bottom: 4px;
      line-height: 1.5;
    }
    .item-specs {
      font-size: 12px;
      color: #57534e;
      font-weight: 500;
    }
    .ref-img {
      width: 75px;
      height: 75px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #d6d3d1;
      display: block;
      margin: 0 auto;
    }
    .no-img {
      width: 75px;
      height: 75px;
      background: #f5f5f4;
      border: 1px dashed #d6d3d1;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      color: #a8a29e;
      margin: 0 auto;
      text-align: center;
    }

    /* SUMMARY SECTION MATCHING IMAGE 4 & 5 */
    .summary-section {
      margin-top: 28px;
      break-inside: avoid;
    }
    .summary-header {
      font-size: 20px;
      font-weight: 900;
      color: #a83232;
      margin: 0 0 12px 0;
      letter-spacing: 0.5px;
    }
    table.summary-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d6d3d1;
    }
    table.summary-table th {
      background: #fafaf9;
      border: 1px solid #d6d3d1;
      padding: 10px 14px;
      font-size: 13.5px;
      font-weight: 800;
      text-align: left;
      color: #1c1917;
    }
    table.summary-table td {
      border: 1px solid #e7e5e4;
      padding: 10px 14px;
      font-size: 13.5px;
      color: #1c1917;
      font-weight: 500;
    }

    /* COMMERCIAL TOTALS BOX WITH PROPER LARGE TEXT */
    .commercial-totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-top: 18px;
      margin-bottom: 24px;
      break-inside: avoid;
    }
    .commercial-totals-box {
      width: 420px;
      border: 2px solid #d4af37;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 11px 18px;
      border-bottom: 1px solid #f5f5f4;
      font-size: 15px;
      font-weight: 700;
      color: #292524;
    }
    .tot-row.discount {
      color: #dc2626;
      background: #fef2f2;
      font-weight: 800;
      font-size: 15.5px;
    }
    .tot-row.grand {
      background: #faf6ed;
      border-top: 2px solid #d4af37;
      border-bottom: none;
      font-weight: 900;
      font-size: 21px;
      color: #9e7b1d;
      padding: 14px 18px;
    }
    .tot-row.grand .tot-val {
      font-size: 22px;
      font-weight: 900;
    }
    .tot-words-bar {
      background: #faf6ed;
      padding: 6px 18px 12px 18px;
      text-align: right;
      font-size: 12px;
      font-weight: 600;
      color: #78716c;
      border-top: 1px dashed #e7e5e4;
    }

    /* TERMS & CONDITIONS ON NEW PAGES MATCHING IMAGE 5 & 6 */
    .tc-page-container {
      page-break-before: always;
      break-before: page;
      margin-top: 36px;
      padding-top: 16px;
      border-top: 2px dashed #d6d3d1;
    }
    .tc-section-title {
      font-size: 18px;
      font-weight: 900;
      color: #a83232;
      margin: 0 0 14px 0;
      letter-spacing: 0.5px;
    }
    .accent-bar-title {
      border-left: 4px solid #a83232;
      padding-left: 12px;
      font-size: 17px;
      font-weight: 900;
      color: #a83232;
      margin: 20px 0 12px 0;
    }
    table.payment-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d6d3d1;
      margin-bottom: 22px;
      font-size: 13px;
    }
    table.payment-table th {
      background: #fafaf9;
      border: 1px solid #d6d3d1;
      padding: 9px 14px;
      font-weight: 800;
      color: #1c1917;
    }
    table.payment-table td {
      border: 1px solid #e7e5e4;
      padding: 9px 14px;
      color: #1c1917;
    }
    .bank-card {
      border: 1px solid #e7e5e4;
      border-left: 4px solid #a83232;
      padding: 14px 18px;
      background: #fafaf9;
      border-radius: 6px;
      margin-bottom: 22px;
    }
    .bank-card h4 {
      margin: 0 0 8px 0;
      font-size: 15px;
      font-weight: 900;
      color: #a83232;
    }
    .bank-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 20px;
      font-size: 13px;
      color: #292524;
      font-weight: 600;
    }
    .tc-list {
      margin: 0 0 16px 0;
      padding-left: 20px;
      font-size: 12.5px;
      line-height: 1.6;
      color: #292524;
    }
    .tc-list li {
      margin-bottom: 8px;
    }
    .tc-note-box {
      background: #fef2f2;
      border-left: 4px solid #a83232;
      padding: 10px 14px;
      font-size: 12.5px;
      font-weight: 800;
      color: #991b1b;
      margin: 16px 0;
      border-radius: 4px;
    }
    .specs-subheading {
      font-size: 15px;
      font-weight: 900;
      color: #a83232;
      margin: 18px 0 8px 0;
    }

    .signatures-row {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 14px;
      font-size: 13px;
      break-inside: avoid;
    }
    .footer-bar {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1.5px solid #d4af37;
      text-align: center;
      font-size: 11px;
      color: #78716c;
      break-inside: avoid;
    }
    .footer-bar strong {
      color: #9e7b1d;
    }

    @media print {
      body {
        margin: 0;
        background: #fff;
      }
      .page-container {
        border: none;
        padding: 0;
        width: 100%;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
      .tc-page-container {
        page-break-before: always;
        break-before: page;
        border-top: none;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #1c1917; color: #fff; padding: 12px 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <div style="display: flex; align-items: center; gap: 14px;">
      <span style="font-weight: 900; font-size: 14px; color: #d4af37; letter-spacing: 0.5px;">VELORA INTERIOR ESTIMATE & BOQ</span>
      <span style="color: #a8a29e; font-size: 12px;">| Print or Select "Save as PDF"</span>
    </div>

    <!-- Live In-Preview T&C Toggle Switch -->
    <div style="display: flex; align-items: center; gap: 16px;">
      <label style="display: inline-flex; align-items: center; gap: 8px; color: #f5f5f4; font-size: 12.5px; font-weight: 700; cursor: pointer; background: #292524; padding: 6px 12px; border-radius: 8px; border: 1px solid #44403c; user-select: none;">
        <input type="checkbox" id="tcToggle" ${includeTerms ? "checked" : ""} onchange="window.toggleTerms(this.checked)" style="width: 16px; height: 16px; accent-color: #d4af37; cursor: pointer;" />
        <span>Include Terms & Conditions (T&C) Pages</span>
      </label>

      <button onclick="window.print()" style="background: #9e7b1d; color: #fff; border: none; padding: 7px 18px; border-radius: 8px; font-weight: 900; font-size: 12.5px; cursor: pointer; transition: background 0.2s;">
        Print / Save PDF
      </button>
      <button onclick="window.close()" style="background: #44403c; color: #fff; border: none; padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer;">
        Close
      </button>
    </div>
  </div>

  <div class="page-container">
    <!-- Brand Header -->
    <div class="header-row">
      <div class="client-box">
        <h4>Prepared for</h4>
        <h2>${clientName}</h2>
        <p><strong>Project:</strong> ${siteLocation}</p>
        ${clientPhone ? `<p><strong>Phone:</strong> ${clientPhone}</p>` : ""}
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Ref No:</strong> ${boqNumber}</p>
      </div>

      <div class="brand-box">
        <h1>VELORA ANTARAAL</h1>
        <div class="tagline">INTERIOR DESIGN | DÉCOR | RETAIL</div>
        <p>Shop No. 242/2/B1, Bafna Niwas, Aundh Hinjewadi Road,</p>
        <p>Wakad, Pune-411057, Maharashtra, India</p>
        <p>+91 86055 26603 / 9284664507</p>
        <p>info@velora.family | https://velora.family</p>
      </div>
    </div>

    <!-- Central ESTIMATE Banner -->
    <div class="title-banner">
      <h2>INTERIOR ESTIMATE & QUOTATION</h2>
    </div>

    <!-- Space-by-Space Tables matching Image 1 to 4 -->
    ${spaces.map((space) => {
      const sItems = (space.items && space.items.length > 0) ? space.items : [
        { name: `${space.name} Scope Execution`, typeVariant: "Turnkey", qty: 1, rate: space.roomTotal || 0, amount: space.roomTotal || 0, sqft: 1 }
      ];

      return `
        <div class="space-block">
          <div class="space-title-bar">${space.name}</div>
          <table class="item-table">
            <thead>
              <tr>
                <th style="width: 32px;">SN</th>
                <th style="text-align: left;">Item Description & Specification</th>
                <th style="width: 80px;">Ref.</th>
                <th style="width: 55px;">UOM</th>
                <th style="width: 85px; text-align: right;">Unit Rate</th>
                <th style="width: 38px;">Qty</th>
                <th style="width: 95px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${sItems.map((it, idx) => {
                const imgUrl = (it.photos && it.photos[0]?.url) || it.image || it.photos?.[0] || "";
                const rate = Number(it.rate) || 0;
                const qty = Number(it.qty) || 1;
                const amt = Number(it.amount) || (rate * (Number(it.sqft) || qty));
                const dims = (it.lengthFt || it.heightFt)
                  ? `Dimension 1: ${it.lengthFt || 0}ft ${it.lengthIn ? `${it.lengthIn}in` : ""} | Dimension 2: ${it.heightFt || 0}ft ${it.heightIn ? `${it.heightIn}in` : ""}${it.depthFt ? ` | Depth: ${it.depthFt}ft` : ""}`
                  : "";

                return `
                  <tr>
                    <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                    <td>
                      <div class="item-name">${it.name || "Custom Component"}</div>
                      <div class="item-cat">${space.name.toUpperCase()} &gt; ${space.name.toUpperCase()} - Category: ${it.typeVariant || "Wood Work"}, Sub Category: ${it.packageVariant || "Standard"}</div>
                      <div class="item-desc">${it.description || `Providing and Installation ${it.name}, made in 18 mm thk Hardcore Triple A grade Okuma face Commercial plywood`}</div>
                      <div class="item-specs">Hardware (Channels, fittings): Onyx / Ebco / Hettich</div>
                      ${dims ? `<div class="item-specs">${dims}</div>` : ""}
                    </td>
                    <td style="text-align: center;">
                      ${imgUrl ? `<img src="${imgUrl}" class="ref-img" alt="Image" onerror="this.style.display='none'" />` : `<div class="no-img">Ref. Image</div>`}
                    </td>
                    <td style="text-align: center; font-weight: 600;">${it.uom || it.unit || "Sq. Ft"}</td>
                    <td style="text-align: right; font-weight: 700;">₹ ${(rate).toLocaleString("en-IN")}</td>
                    <td style="text-align: center; font-weight: 700;">${qty}</td>
                    <td style="text-align: right; font-weight: 900;">₹ ${(amt).toLocaleString("en-IN")}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    }).join("")}

    <!-- SUMMARY SECTION MATCHING IMAGE 4 & 5 -->
    <div class="summary-section">
      <h3 class="summary-header">Summary</h3>
      <table class="summary-table">
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">SN</th>
            <th>Area</th>
            <th style="width: 110px; text-align: center;">Quantity</th>
            <th style="width: 170px; text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${spaces.map((sp, idx) => {
            let sSum = 0;
            (sp.items || []).forEach((it) => {
              sSum += Number(it.amount || ((Number(it.rate) || 0) * (Number(it.sqft) || Number(it.qty) || 1)));
            });
            if (sSum === 0 && sp.roomTotal) sSum = Number(sp.roomTotal);
            const count = (sp.items && sp.items.length > 0) ? sp.items.length : 1;

            return `
              <tr>
                <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
                <td style="font-weight: 800; text-transform: uppercase;">${sp.name}</td>
                <td style="text-align: center; font-weight: 800;">${count}</td>
                <td style="text-align: right; font-weight: 900;">₹ ${sSum.toLocaleString("en-IN")}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>

    <!-- COMMERCIAL TOTALS BOX WITH PROPER LARGE TEXT MATCHING IMAGE 5 -->
    <div class="commercial-totals-wrap">
      <div class="commercial-totals-box">
        <div class="tot-row">
          <span>Total</span>
          <span style="font-size: 17px; font-weight: 900;">₹ ${spacesSubtotal.toLocaleString("en-IN")}</span>
        </div>
        ${discountAmount > 0 ? `
          <div class="tot-row discount">
            <span>Discount</span>
            <span style="font-size: 17px; font-weight: 900;">- ₹ ${discountAmount.toLocaleString("en-IN")}</span>
          </div>
        ` : ""}
        ${gstTotal > 0 ? `
          <div class="tot-row">
            <span>GST (${gstPercent}%)</span>
            <span style="font-size: 17px; font-weight: 900;">₹ ${gstTotal.toLocaleString("en-IN")}</span>
          </div>
        ` : ""}
        <div class="tot-row grand">
          <span>Grand Total</span>
          <span class="tot-val">₹ ${grandTotal.toLocaleString("en-IN")}</span>
        </div>
        <div class="tot-words-bar">
          ${numberToWordsIN(grandTotal)}
        </div>
      </div>
    </div>

    <!-- DEDICATED TERMS & CONDITIONS PAGES MATCHING IMAGE 5 & 6 -->
    <!-- STARTS ON A CLEAN NEW PAGE! -->
    <div id="tc-page-section" class="tc-page-container" style="${includeTerms ? '' : 'display: none;'}">
      <!-- 1. Payment Plan Table -->
      <h3 class="tc-section-title">Payment Plan</h3>
      <table class="payment-table">
        <thead>
          <tr>
            <th>Milestone</th>
            <th style="width: 110px; text-align: center;">Percent</th>
            <th style="width: 170px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${milestones.map((m) => `
            <tr>
              <td style="font-weight: 700;">${m.milestone}</td>
              <td style="text-align: center; font-weight: 800;">${m.percent}%</td>
              <td style="text-align: right; font-weight: 900;">₹ ${m.amount.toLocaleString("en-IN")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- 2. Bank Account Details -->
      <div class="bank-card">
        <h4>Bank Account Details</h4>
        <div class="bank-grid">
          <div>Account Holder: <strong>${tcTemplate.bankDetails.accountHolder}</strong></div>
          <div>Account Number: <strong>${tcTemplate.bankDetails.accountNumber}</strong></div>
          <div>IFSC: <strong>${tcTemplate.bankDetails.ifsc}</strong></div>
          <div>Branch: <strong>${tcTemplate.bankDetails.branch}</strong></div>
          <div>Account Type: <strong>${tcTemplate.bankDetails.accountType}</strong></div>
        </div>
      </div>

      <!-- 3. Terms and Conditions (16 Clauses) -->
      <div class="accent-bar-title">Terms and Conditions</div>
      <ol class="tc-list">
        ${tcTemplate.termsList.map((item) => `
          <li><strong>${item.title ? `${item.title}: ` : ""}</strong>${item.text}</li>
        `).join("")}
      </ol>

      <div class="tc-note-box">
        ${tcTemplate.note || "Note : Debris removal / Deep cleaning charges shall be charged at actuals.( Borne by the client )"}
      </div>

      <!-- 4. Material Details -->
      <div class="accent-bar-title" style="margin-top: 24px;">Material Details:</div>
      <ol class="tc-list">
        ${tcTemplate.materialDetails.map((mat) => `
          <li><strong>${mat.title}: </strong>${mat.text}</li>
        `).join("")}
      </ol>

      <!-- 5. Warranty Details -->
      <div class="accent-bar-title" style="margin-top: 24px;">WARRANTY Details:</div>
      <ol class="tc-list">
        ${tcTemplate.warrantyDetails.map((wText) => `
          <li>${wText}</li>
        `).join("")}
      </ol>

      <!-- Signatures Row inside T&C -->
      <div class="signatures-row">
        <div>
          <p style="font-weight: 600;">Client Acceptance Signature: ___________________________</p>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 800; color: #9e7b1d; margin: 0;">For VELORA ANTARAAL</p>
          <p style="margin: 30px 0 0 0; color: #57534e;">Authorized Signatory</p>
        </div>
      </div>

      <div class="footer-bar">
        <div><strong>SPACES WITHIN, DESIGNED BEAUTIFULLY</strong></div>
        <div>+91 86055 26603 | +91 820-8732741  •  info@velora.family  •  https://velora.family  •  Wakad, Pune, Maharashtra, India</div>
      </div>
    </div>

    <!-- Signatures Row when T&C is excluded -->
    <div id="standalone-signatures" style="${includeTerms ? 'display: none;' : 'display: block;'}">
      <div class="signatures-row">
        <div>
          <p style="font-weight: 600;">Client Acceptance Signature: ___________________________</p>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 800; color: #9e7b1d; margin: 0;">For VELORA ANTARAAL</p>
          <p style="margin: 30px 0 0 0; color: #57534e;">Authorized Signatory</p>
        </div>
      </div>
      <div class="footer-bar">
        <div><strong>SPACES WITHIN, DESIGNED BEAUTIFULLY</strong></div>
        <div>+91 86055 26603 | +91 820-8732741  •  info@velora.family  •  https://velora.family  •  Wakad, Pune, Maharashtra, India</div>
      </div>
    </div>
  </div>

  <script>
    window.toggleTerms = function(show) {
      var tcEl = document.getElementById('tc-page-section');
      var standaloneSig = document.getElementById('standalone-signatures');
      if (tcEl) tcEl.style.display = show ? 'block' : 'none';
      if (standaloneSig) standaloneSig.style.display = show ? 'none' : 'block';
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
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
 * Client-Side Luxury Invoice PDF Generator (Exact match for Velora Tax Invoice layout)
 */
export const generateClientSideInvoicePdf = (invoice) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const invNum = invoice?.invoiceNumber || "NCIA003";
  const projName = invoice?.projectName || invoice?.clientName || "PREM SHUKLA";
  const projNumber = invoice?.projectNumber || "PRJ-2026-008";
  const clientName = invoice?.billTo?.name || invoice?.clientName || "PREM SHUKLA";
  const clientEmail = invoice?.billTo?.email || invoice?.clientEmail || "PREMSHUKLA@GMAIL.COM";
  const clientPhone = invoice?.billTo?.phone || invoice?.clientPhone || "+91 78000 20496";
  const clientAddress = invoice?.billTo?.address || invoice?.clientAddress || "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, PIMPRI CHINCHWAD, PUNE, MAHARASHTRA, 411057";

  const shipName = invoice?.shipTo?.name || (invoice?.sameAsBillTo ? clientName : "-");
  const shipEmail = invoice?.shipTo?.email || (invoice?.sameAsBillTo ? clientEmail : "-");
  const shipPhone = invoice?.shipTo?.phone || (invoice?.sameAsBillTo ? clientPhone : "-");
  const shipAddress = invoice?.shipTo?.address || (invoice?.sameAsBillTo ? clientAddress : "-");

  const grandTotal = Number(invoice?.grandTotal) || 468800;
  const subtotal = Number(invoice?.subtotal) || grandTotal;
  const gstTotal = Number(invoice?.gstTotal) || 0;

  const headerBlue = [67, 120, 240];

  // Helper for Section Titles
  const renderHeaderBox = (x, y, w, title) => {
    doc.setFillColor(...headerBlue);
    doc.rect(x, y, w, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(title, x + 6, y + 11);
  };

  // --- PAGE 1: Header, Company & Client Info, Items Table ---
  // Top Left Logo Placeholder
  doc.setFillColor(15, 23, 42);
  doc.rect(40, 35, 75, 45, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text("VELORA", 77.5, 60, { align: "center" });

  // Company Name Center
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text("VELORA LUXURY INTERIORS", 200, 48);

  // Top Right TAX INVOICE Box
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("TAX INVOICE", 555, 38, { align: "right" });

  doc.setDrawColor(...headerBlue);
  doc.rect(370, 48, 185, 45, "S");
  doc.setFillColor(...headerBlue);
  doc.rect(370, 48, 185, 14, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Original For Recipient", 462.5, 58, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("E-INVOICE NO", 376, 73);
  doc.setFont("helvetica", "bold");
  doc.text(invNum, 470, 73);

  doc.setFont("helvetica", "normal");
  doc.text("INVOICE DATE", 376, 86);
  doc.setFont("helvetica", "bold");
  doc.text(new Date(invoice?.issueDate || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), 470, 86);

  // Section 1: INVOICE FROM vs PROJECT INFORMATION
  let startY = 100;
  renderHeaderBox(40, startY, 255, "INVOICE FROM");
  renderHeaderBox(300, startY, 255, "PROJECT INFORMATION");

  doc.setDrawColor(203, 213, 225);
  doc.rect(40, startY + 16, 255, 75, "S");
  doc.rect(300, startY + 16, 255, 75, "S");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  // Invoice From Data
  doc.text("LEGAL NAME", 46, startY + 28);
  doc.setFont("helvetica", "bold");
  doc.text("VELORA LUXURY INTERIORS", 115, startY + 28);

  doc.setFont("helvetica", "normal");
  doc.text("GST NO", 46, startY + 39);
  doc.text("27CHCPS9945R1Z4", 115, startY + 39);

  doc.text("PAN NO", 46, startY + 50);
  doc.text("CHCPS9945R", 115, startY + 50);

  doc.text("STATE", 46, startY + 61);
  doc.text("Maharashtra", 115, startY + 61);

  doc.text("EMAIL", 46, startY + 72);
  doc.text("info@veloraluxury.com", 115, startY + 72);

  doc.text("CONTACT NO", 46, startY + 83);
  doc.text("8055526603", 115, startY + 83);

  // Project Info Data
  doc.text("PROJECT NAME", 308, startY + 28);
  doc.setFont("helvetica", "bold");
  doc.text(projName, 385, startY + 28);

  doc.setFont("helvetica", "normal");
  doc.text("PROJECT (PID)", 308, startY + 39);
  doc.setFont("helvetica", "bold");
  doc.text(projNumber, 385, startY + 39);

  doc.setFont("helvetica", "normal");
  doc.text("PLACE OF SUPPLY", 308, startY + 50);
  doc.text("Maharashtra (27)", 385, startY + 50);

  // Section 2: Bill To vs Ship To
  startY += 98;
  renderHeaderBox(40, startY, 255, "Details of Receiver(Bill to)");
  renderHeaderBox(300, startY, 255, "Details of Consignee(Ship to)");

  doc.setDrawColor(203, 213, 225);
  doc.rect(40, startY + 16, 255, 70, "S");
  doc.rect(300, startY + 16, 255, 70, "S");

  // Bill To Data
  doc.setFont("helvetica", "normal");
  doc.text("CLIENT NAME", 46, startY + 27);
  doc.setFont("helvetica", "bold");
  doc.text(clientName, 115, startY + 27);

  doc.setFont("helvetica", "normal");
  doc.text("CONTACT NO", 46, startY + 38);
  doc.text(clientPhone || "-", 115, startY + 38);

  doc.text("ADDRESS", 46, startY + 49);
  doc.text(clientAddress ? clientAddress.substring(0, 38) : "-", 115, startY + 49);

  doc.text("EMAIL", 46, startY + 60);
  doc.text(clientEmail || "-", 115, startY + 60);

  doc.text("PIN CODE", 46, startY + 71);
  doc.text("411057", 115, startY + 71);

  // Ship To Data
  doc.setFont("helvetica", "normal");
  doc.text("CLIENT NAME", 308, startY + 27);
  doc.setFont("helvetica", "bold");
  doc.text(shipName || clientName, 380, startY + 27);

  doc.setFont("helvetica", "normal");
  doc.text("CONTACT NO", 308, startY + 38);
  doc.text(shipPhone || clientPhone || "-", 380, startY + 38);

  doc.text("ADDRESS", 308, startY + 49);
  doc.text(shipAddress ? shipAddress.substring(0, 38) : (clientAddress ? clientAddress.substring(0, 38) : "-"), 380, startY + 49);

  doc.text("EMAIL", 308, startY + 60);
  doc.text(shipEmail || clientEmail || "-", 380, startY + 60);

  doc.text("PIN CODE", 308, startY + 71);
  doc.text("411057", 380, startY + 71);

  // Section 3: Line Items Table matching Image 2
  const rawItems = (invoice?.items && invoice.items.length > 0)
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

  const tableBody = rawItems.map((it, idx) => [
    String(idx + 1),
    it.productName || it.description || "Supply Component",
    it.hsnSac || "995476",
    String(it.uom || it.unit || "-"),
    String(it.quantity || 1),
    `Rs. ${(Number(it.rate) || 0).toLocaleString("en-IN")}`,
    `${it.gstPercent || 0}%`,
    `Rs. ${(Number(it.total) || (Number(it.rate) * Number(it.quantity || 1))).toLocaleString("en-IN")}`
  ]);

  // Append Subtotal, Tax & Grand Total rows to table body matching Image 2
  tableBody.push([
    { content: "Sub Total Amount", colSpan: 7, styles: { halign: "right", fontStyle: "bold" } },
    { content: `Rs. ${subtotal.toLocaleString("en-IN")}`, styles: { halign: "right", fontStyle: "bold" } }
  ]);
  tableBody.push([
    { content: "Total Tax", colSpan: 7, styles: { halign: "right", fontStyle: "bold" } },
    { content: `Rs. ${gstTotal.toLocaleString("en-IN")}`, styles: { halign: "right", fontStyle: "bold" } }
  ]);
  tableBody.push([
    { content: "Grand Total Amount", colSpan: 7, styles: { halign: "right", fontStyle: "bold", fillColor: [67, 120, 240], textColor: [255, 255, 255] } },
    { content: `Rs. ${grandTotal.toLocaleString("en-IN")}`, styles: { halign: "right", fontStyle: "bold", fillColor: [67, 120, 240], textColor: [255, 255, 255] } }
  ]);

  autoTable(doc, {
    startY: startY + 95,
    margin: { left: 40, right: 40 },
    head: [["SL.NO", "PRODUCT/SERVICE NAME", "HSN/SAC", "UOM", "QTY", "UNIT RATE", "TAX RATIO (%)", "TAXABLE AMOUNT"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [67, 120, 240],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 35, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 160 },
      2: { cellWidth: 55, halign: "center" },
      3: { cellWidth: 40, halign: "center" },
      4: { cellWidth: 30, halign: "center" },
      5: { cellWidth: 60, halign: "right" },
      6: { cellWidth: 55, halign: "center" },
      7: { cellWidth: 80, halign: "right", fontStyle: "bold" }
    }
  });

  let finalY = (doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : startY + 260);

  // Total Invoice Amount In Words row matching Image 2
  doc.setDrawColor(203, 213, 225);
  doc.rect(40, finalY, 515, 20, "S");
  doc.setFillColor(226, 232, 240);
  doc.rect(40, finalY, 170, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Total Invoice Amount In Words", 46, finalY + 13);
  doc.setFont("helvetica", "bold");
  doc.text(numberToWordsIN(grandTotal), 220, finalY + 13);

  // --- PAGE 2: Bank Details, Scan to Pay, Notes & Terms & Conditions Part 1 ---
  doc.addPage();

  // Bank Details Box matching Image 2 & 3
  renderHeaderBox(40, 40, 515, "BANK DETAILS & PAYMENT INSTRUCTIONS");
  doc.setDrawColor(203, 213, 225);
  doc.rect(40, 56, 515, 65, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Account Holder: VELORA LUXURY INTERIORS", 48, 70);
  doc.setFont("helvetica", "normal");
  doc.text("Account Number: 50200073374185", 48, 82);
  doc.text("IFSC: HDFC0000223 | Branch: WAKAD / PASHAN", 48, 94);
  doc.text("Account Type: Current Account | UPI ID: veloraluxury@hdfcbank", 48, 106);

  // Scan to Pay Box matching Image 3
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Scan to pay", 40, 138);
  doc.rect(40, 145, 90, 80, "S");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("[ PhonePe / UPI QR Code ]", 85, 185, { align: "center" });

  // Notes Box matching Image 3
  renderHeaderBox(40, 240, 515, "Notes");
  doc.rect(40, 256, 515, 20, "S");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.text("Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.", 48, 269);

  // Terms & Conditions Header & Part 1 matching Image 3
  renderHeaderBox(40, 290, 515, "Terms & Conditions");
  doc.rect(40, 306, 515, 480, "S");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("TERMS & CONDITIONS - For Interior Design & Turnkey Execution Services", 48, 320);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  let termY = 335;
  const addTerm = (title, body) => {
    doc.setFont("helvetica", "bold");
    doc.text(title, 48, termY);
    termY += 10;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(body, 500);
    doc.text(lines, 48, termY);
    termY += (lines.length * 8) + 6;
  };

  addTerm("1. Scope of Work", "The scope of work includes interior design consultancy, space planning, material selection, 2D/3D drawings, furniture design, civil work, electrical work, false ceiling, modular furniture, décor assistance, site supervision, and turnkey execution as mutually agreed in the final quotation/work order. Any work outside the approved quotation shall be treated as additional work and billed separately.");
  addTerm("2. Design Process", "1. Initial consultation & requirement discussion. 2. Concept design and layout planning. 3. Material and finish selection. 4. Final design approval. 5. Execution and site coordination. 6. Project handover. Design revisions beyond agreed number may attract additional charges.");
  addTerm("3. Quotation & Pricing", "- All quotations are valid for 15 days from the date of issue.\n- Prices are based on current market rates of materials and labour.\n- Any increase in material cost, taxes, transport, or vendor pricing after quotation approval may lead to revised costing.");
  addTerm("4. Payment Terms", "- 10% Advance – Booking & Design Initiation\n- 40% – Before Production/Execution\n- 40% – During Execution Stage\n- 10% – Before Final Handover\nAll payments must be made as per agreed timelines. Delay in payment may lead to work suspension and revised delivery timelines.");
  addTerm("5. Project Timeline", "- Timelines are estimated based on project scope and site conditions.\n- Delays caused due to civil issues, approvals, client-side delays, vendor delays, material shortages, force majeure events, or changes in design shall not be considered the company's liability.\n- Working days exclude Sundays and public holidays unless otherwise specified.");
  addTerm("6. Client Responsibilities", "The client shall: Provide timely approvals and decisions; Ensure site accessibility and basic utilities like electricity and water; Clear all dues as per payment schedule; Coordinate with society management/building authorities for permissions if required.");
  addTerm("7. Material & Finishes", "- Natural variations in wood, veneer, marble, laminates, fabric, stone, and other materials are normal and not considered defects.\n- Shade differences may occur due to lighting and batch variation.\n- Availability of selected materials is subject to market conditions.");
  addTerm("8. Warranty", "Modular Furniture & Interior Work Warranty:\n- Warranty period: 5 years for modular furniture manufacturing defects.\n- Hardware warranty shall be as per respective brand manufacturer policy.");

  // --- PAGE 3: Terms & Conditions Part 2, Signatures & Seal ---
  doc.addPage();

  doc.rect(40, 40, 515, 620, "S");
  termY = 55;

  addTerm("9. Cancellation Policy", "- Booking amount/design fees are non-refundable.\n- In case of project cancellation after production/execution initiation, charges for completed work, materials procured, labour, and applicable damages shall be recoverable from the client.");
  addTerm("10. Ownership of Designs", "All drawings, concepts, renders, and designs remain intellectual property of VELORA LUXURY INTERIORS unless otherwise agreed in writing. Unauthorized copying or execution through third parties is prohibited.");
  addTerm("11. Photography & Portfolio Rights", "The company reserves the right to photograph completed projects for portfolio, social media, website, and marketing purposes unless the client specifically requests confidentiality in writing.");
  addTerm("12. Limitation of Liability", "The company shall not be liable for: Structural defects of the property; Existing site issues; Delays due to external agencies/vendors; Damages caused after handover due to misuse or negligence.");
  addTerm("13. Force Majeure", "The company shall not be responsible for delays or non-performance caused by events beyond reasonable control including natural disasters, strikes, government restrictions, pandemics, transport disruptions, or supply chain interruptions.");
  addTerm("14. Dispute Resolution", "Any disputes arising shall be subject to the jurisdiction of Pune, Maharashtra courts only.");
  addTerm("15. Acceptance", "Approval of quotation/work order and payment of advance shall be considered acceptance of these Terms & Conditions.");

  // Signatures Section matching Image 4
  termY += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("Client Signature: _______________________", 48, termY);
  doc.text("Date: _________________", 260, termY);

  termY += 25;
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signatory", 48, termY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("VELORA LUXURY INTERIORS", 48, termY + 12);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Bespoke Designs • Turnkey Execution", 48, termY + 22);

  // Authorised Common Seal Box matching Image 4
  const sealY = 675;
  renderHeaderBox(40, sealY, 515, "VELORA LUXURY INTERIORS");
  doc.setDrawColor(203, 213, 225);
  doc.rect(40, sealY + 16, 515, 60, "S");
  doc.line(40, sealY + 50, 555, sealY + 50);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("Authorised Common seal", 297.5, sealY + 63, { align: "center" });

  // Computer generated footer note matching Image 4
  doc.line(40, sealY + 76, 555, sealY + 76);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("This is a computer generated invoice, Hence no signature is required.", 297.5, sealY + 88, { align: "center" });

  if (isPrint) {
    try {
      doc.autoPrint();
      const blobUrl = doc.output("bloburl");
      window.open(blobUrl, "_blank");
    } catch (e) {
      console.warn("Auto-print preview error, falling back to download:", e);
      doc.save(`${invNum}.pdf`);
    }
  } else {
    doc.save(`${invNum}.pdf`);
  }
};

/**
 * Universal Download Function for Invoice PDF
 */
export const downloadInvoicePdf = async (invoiceOrId, customFilename) => {
  const id = typeof invoiceOrId === "object" ? (invoiceOrId?._id || invoiceOrId?.invoiceNumber) : invoiceOrId;
  const filename = customFilename || (typeof invoiceOrId === "object" ? `${invoiceOrId?.invoiceNumber || "Invoice"}.pdf` : `Invoice_${id}.pdf`);

  // Instant client-side download if full object is passed
  if (typeof invoiceOrId === "object" && (invoiceOrId.clientName || invoiceOrId.invoiceNumber)) {
    try {
      generateClientSideInvoicePdf(invoiceOrId, false);
      return;
    } catch (err) {
      console.warn("Client-side PDF generation fallback attempt:", err);
    }
  }

  try {
    const token = localStorage.getItem("velora_admin_token") || localStorage.getItem("velora_token") || "";
    const backendUrl = erpApi.exportInvoicePdfUrl(id);

    const res = await fetch(backendUrl + (token ? `?token=${encodeURIComponent(token)}` : ""), {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, filename);
      return;
    }
  } catch (err) {
    console.warn("Backend Invoice download failed, using client fallback:", err);
  }

  const invData = typeof invoiceOrId === "object" ? invoiceOrId : { invoiceNumber: String(id), clientName: "Valued Client", grandTotal: 468800 };
  generateClientSideInvoicePdf(invData, false);
};

/**
 * Direct Print Invoice Function
 */
export const printInvoice = async (invoiceOrId) => {
  if (typeof invoiceOrId === "object" && (invoiceOrId.clientName || invoiceOrId.invoiceNumber)) {
    generateClientSideInvoicePdf(invoiceOrId, true);
    return;
  }
  try {
    const id = typeof invoiceOrId === "object" ? (invoiceOrId?._id || invoiceOrId?.invoiceNumber) : invoiceOrId;
    const res = await erpApi.getInvoiceById(id);
    if (res?.success && res.data) {
      generateClientSideInvoicePdf(res.data, true);
      return;
    }
  } catch {
    // Fallback
  }
  downloadInvoicePdf(invoiceOrId);
};

/**
 * Export Single Invoice Data as CSV/Excel Data
 */
export const exportInvoiceCsv = (invoice) => {
  const invNum = invoice?.invoiceNumber || "Invoice";
  const items = invoice?.items || [];

  console.log("Exporting invoice CSV:", invoice);

  const columns = [
    { header: "Invoice Number", key: "invoiceNumber" },
    { header: "Client Name", key: "clientName" },
    { header: "Invoice Date", key: "issueDate" },
    { header: "Item Description", key: "productName" },
    { header: "HSN/SAC", key: "hsnSac" },
    { header: "UOM", key: "uom" },
    { header: "Quantity", key: "quantity" },
    { header: "Unit Rate (Rs)", key: "rate" },
    { header: "GST Ratio (%)", key: "gstPercent" },
    { header: "Total Taxable Amount (Rs)", key: "total" }
  ];


  let data = items.map((item) => ({
    invoiceNumber: invNum,
    clientName: invoice?.clientName || invoice?.billTo?.name || "Client",
    issueDate: invoice?.issueDate ? new Date(invoice.issueDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
    productName: item.productName || item.description || "Supply Component",
    hsnSac: item.hsnSac || "995476",
    uom: item.uom || item.unit || "-",
    quantity: item.quantity || 1,
    rate: item.rate || 0,
    gstPercent: item.gstPercent || 18,
    total: item.total || (Number(item.rate || 0) * Number(item.quantity || 1))
  }));

  if (data.length === 0) {
    data = [{
      invoiceNumber: invNum,
      clientName: invoice?.clientName || invoice?.billTo?.name || "Client",
      issueDate: invoice?.issueDate ? new Date(invoice.issueDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
      productName: "Turnkey Interior Execution",
      hsnSac: "995476",
      uom: "LS",
      quantity: 1,
      rate: invoice?.subtotal || invoice?.grandTotal || 468800,
      gstPercent: 18,
      total: invoice?.grandTotal || 468800
    }];
  }

  downloadCsv(`${invNum}_Items_Data`, columns, data);
};

// for(const i=0; i<=9; i++){
//   console.log(i)
// }
/**
 * Export All Invoices Summary Data as CSV
 */
export const exportAllInvoicesCsv = (invoices) => {
  const columns = [
    { header: "Invoice No", key: "invoiceNumber" },
    { header: "Client Name", key: "clientName" },
    { header: "Client Phone", key: "phone" },
    { header: "Client Email", key: "email" },
    { header: "Invoice Type", key: "invoiceType" },
    { header: "Invoice Date", key: "issueDate" },
    { header: "Due Date", key: "dueDate" },
    { header: "Subtotal (Rs)", key: "subtotal" },
    { header: "GST Total (Rs)", key: "gstTotal" },
    { header: "Grand Total (Rs)", key: "grandTotal" },
    { header: "Paid Amount (Rs)", key: "paidAmount" },
    { header: "Balance Due (Rs)", key: "balanceDue" },
    { header: "Status", key: "status" }
  ];

  const data = (invoices || []).map((inv) => ({
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.clientName || inv.billTo?.name || "Client",
    phone: inv.clientPhone || inv.billTo?.phone || "-",
    email: inv.clientEmail || inv.billTo?.email || "-",
    invoiceType: inv.invoiceType || "Supply",
    issueDate: inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("en-IN") : "-",
    dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "-",
    subtotal: inv.subtotal || 0,
    gstTotal: inv.gstTotal || 0,
    grandTotal: inv.grandTotal || 0,
    paidAmount: inv.paidAmount || 0,
    balanceDue: inv.balanceDue !== undefined ? inv.balanceDue : ((inv.grandTotal || 0) - (inv.paidAmount || 0)),
    status: inv.status || "Unpaid"
  }));

  downloadCsv("Velora_Invoices_Master_Summary", columns, data);
};

/**
 * Client-Side Luxury Payment Receipt PDF Generator
 */
export const generateClientSideReceiptPdf = (payment) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const recNum = payment?.receiptNumber || "REC-VEL-2001";
  const clientName = payment?.clientName || "Valued Client";
  const amount = Number(payment?.amount) || 0;

  // Brand Header
  doc.setFillColor(197, 160, 89);
  doc.rect(40, 30, 515, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(158, 123, 29);
  doc.text("VELORA LUXURY INTERIORS", 40, 55);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text("OFFICIAL PAYMENT RECEIPT", 40, 68);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(28, 25, 23);
  doc.text(`RECEIPT: ${recNum}`, 555, 55, { align: "right" });

  // Receipt Card
  doc.setFillColor(250, 249, 245);
  doc.roundedRect(40, 90, 515, 120, 8, 8, "F");
  doc.setDrawColor(234, 227, 210);
  doc.roundedRect(40, 90, 515, 120, 8, 8, "S");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Received with thanks from:", 60, 115);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text(clientName.toUpperCase(), 60, 130);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Mode: ${payment?.paymentMethod || "Bank Transfer / RTGS"}`, 60, 155);
  doc.text(`Transaction Ref: ${payment?.transactionId || "TXN-984920"}`, 60, 170);
  doc.text(`Payment Date: ${new Date(payment?.paymentDate || Date.now()).toLocaleDateString("en-IN")}`, 60, 185);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(158, 123, 29);
  doc.text(`AMOUNT RECEIVED: Rs. ${amount.toLocaleString("en-IN")}`, 320, 150);

  doc.save(`${recNum}.pdf`);
};

/**
 * Universal Download Function for Payment Receipt PDF
 */
export const downloadReceiptPdf = async (paymentOrId, customFilename) => {
  const id = typeof paymentOrId === "object" ? (paymentOrId?._id || paymentOrId?.receiptNumber) : paymentOrId;
  const filename = customFilename || (typeof paymentOrId === "object" ? `${paymentOrId?.receiptNumber || "Receipt"}.pdf` : `Receipt_${id}.pdf`);

  try {
    const token = localStorage.getItem("velora_token") || "";
    const backendUrl = erpApi.exportReceiptPdfUrl(id);

    const res = await fetch(backendUrl + (token ? `?token=${encodeURIComponent(token)}` : ""), {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, filename);
      return;
    }
  } catch (err) {
    console.warn("Backend Receipt download failed, using client fallback:", err);
  }

  const payData = typeof paymentOrId === "object" ? paymentOrId : { receiptNumber: String(id), clientName: "Valued Client", amount: 500000 };
  generateClientSideReceiptPdf(payData);
};

/**
 * Universal CSV Exporter
 */
export const downloadCsv = (filename, columns, data) => {
  if (!data || data.length === 0) return;

  const headerRow = columns.map((col) => `"${col.header || col.key || col}"`).join(",");
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        let val = typeof col.renderValue === "function" ? col.renderValue(row) : row[col.key || col];
        if (val === undefined || val === null) val = "";
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(",")
  );



  const csvContent = [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerBlobDownload(blob, `${filename.replace(/\.csv$/, "")}.csv`);
};
