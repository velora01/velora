import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import erpApi from "../services/erpService";
import { getCurrentUser } from "../services/authService";
import { getActiveCompanySettings } from "../constants/companySettings";
import {
  DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE,
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

export const DEFAULT_BOQ_PRINT_COLUMNS = {
  showSN: true,
  showItemName: true,
  showDescription: true,
  showDimensions: true,
  showRefImage: true,
  showUom: true,
  showUnitRate: true,
  showQuantity: true,
  showPrice: true
};

/**
 * Client-Side Luxury BOQ / Estimate PDF Generator Matching User Images
 * (Image 1 Table Structure with Ref. Images + Image 2 Velora Antaraal Theme, Totals & T&C)
 */
export const generateClientSideBOQPdf = async (boq, options = {}) => {
  const includeTerms = options.includeTerms !== false;
  const printCols = {
    ...DEFAULT_BOQ_PRINT_COLUMNS,
    ...(boq?.printColumns || {}),
    ...(options?.printColumns || {})
  };

  const showSN = printCols.showSN !== false;
  const showItemName = printCols.showItemName !== false;
  const showDescription = printCols.showDescription !== false;
  const showDimensions = printCols.showDimensions !== false;
  const showRefImage = printCols.showRefImage !== false;
  const showUom = printCols.showUom !== false;
  const showUnitRate = printCols.showUnitRate !== false;
  const showQuantity = printCols.showQuantity !== false;
  const showPrice = printCols.showPrice !== false;
  const showMainDesc = showItemName || showDescription || showDimensions;

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

  const allSpaces = Array.isArray(boq?.spaces) ? boq.spaces : [];
  const populatedSpaces = allSpaces.filter((sp) => Array.isArray(sp.items) && sp.items.length > 0);
  const spaces = populatedSpaces.length > 0 ? populatedSpaces : allSpaces.filter((sp) => Number(sp.roomTotal) > 0);

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
  const gstPercent = boq?.gstPercent !== undefined ? Number(boq.gstPercent) : 0;
  const cgstAmount = Math.round(taxableAmount * (gstPercent / 200));
  const sgstAmount = Math.round(taxableAmount * (gstPercent / 200));
  const gstTotal = cgstAmount + sgstAmount;
  const grandTotal = taxableAmount + gstTotal;

  // Pre-load all line item images into base64
  for (const space of spaces) {
    for (const item of (space.items || [])) {
      const imgUrl = (item.photos && item.photos[0]?.url) || item.image || item.photos?.[0] || "";
      if (imgUrl && !item._base64) {
        item._base64 = await loadImageDataUrl(imgUrl);
      }
    }
  }

  // Header Left: Professional Client Dossier Card
  doc.setFillColor(250, 246, 237);
  doc.roundedRect(40, 36, 255, 78, 4, 4, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.roundedRect(40, 36, 255, 78, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(158, 123, 29);
  doc.text("PREPARED EXCLUSIVELY FOR", 50, 50);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(28, 25, 23);
  doc.text(String(clientName).toUpperCase(), 50, 66);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 70, 65);
  doc.text(`Project Site: ${siteLocation}`, 50, 80);
  if (clientPhone) {
    doc.text(`Phone: ${clientPhone}  |  Date: ${formattedDate}`, 50, 93);
    doc.text(`Quotation Ref: ${boqNum}`, 50, 105);
  } else {
    doc.text(`Date: ${formattedDate}  |  Quotation Ref: ${boqNum}`, 50, 93);
  }

  // Header Right: Company Dossier Card with matching background and border
  doc.setFillColor(250, 246, 237);
  doc.roundedRect(305, 36, 250, 78, 4, 4, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.roundedRect(305, 36, 250, 78, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(158, 123, 29);
  doc.text("PREPARED BY / COMPANY", 545, 50, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(201, 162, 39); // Luxury Gold
  doc.text("VELORA ANTARAAL LLP", 545, 66, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.text("INTERIOR DESIGN | DÉCOR | RETAIL", 545, 78, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(75, 70, 65);
  doc.text("S. No. 242/1, Wakad, Pune - 411033 | +91 80555 26603", 545, 90, { align: "right" });
  doc.text("info@velora.family | https://velora.family", 545, 102, { align: "right" });

  let currentY = 126;

  // Build dynamic headers and column styles based on active printColumns
  const headCols = [];
  const colStyles = {};
  let cIdx = 0;

  if (showSN) {
    headCols.push("SN");
    colStyles[cIdx++] = { cellWidth: 26, halign: "center", fontStyle: "bold" };
  }
  let descColIndex = -1;
  if (showMainDesc) {
    headCols.push("Item Description & Specification");
    descColIndex = cIdx;
    colStyles[cIdx++] = { cellWidth: "auto" };
  }
  let imgColIndex = -1;
  if (showRefImage) {
    headCols.push("Image");
    imgColIndex = cIdx;
    colStyles[cIdx++] = { cellWidth: 68, halign: "center" };
  }
  if (showUom) {
    headCols.push("UOM");
    colStyles[cIdx++] = { cellWidth: 38, halign: "center", fontStyle: "bold" };
  }
  if (showUnitRate) {
    headCols.push("Unit Rate");
    colStyles[cIdx++] = { cellWidth: 60, halign: "right", fontStyle: "bold" };
  }
  if (showQuantity) {
    headCols.push("Qty");
    colStyles[cIdx++] = { cellWidth: 28, halign: "center", fontStyle: "bold" };
  }
  if (showPrice) {
    headCols.push("Price");
    colStyles[cIdx++] = { cellWidth: 75, halign: "right", fontStyle: "bold" };
  }

  // Ensure fallback header if all columns somehow deselected
  if (headCols.length === 0) {
    headCols.push("Item Description");
    colStyles[0] = { cellWidth: "auto" };
  }

  // Space-by-Space Tables - ONLY render spaces with actual added items
  spaces.forEach((space) => {
    const spaceItems = Array.isArray(space.items) && space.items.length > 0 ? space.items : [];
    if (spaceItems.length === 0) return;

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

    const tableRows = spaceItems.map((item, idx) => {
      const name = item.name || "Interior Component";
      const spaceCategory = `${space.name.toUpperCase()} > ${space.name.toUpperCase()} - Category: ${item.typeVariant || "Wood Work"}, Sub Category: ${item.packageVariant || "Standard"}`;
      const description = item.description || `Providing and Installation ${item.name}, made in 18 mm thk Hardcore Triple A grade Okuma face Commercial plywood`;
      const dims = (item.lengthFt || item.lengthIn || item.heightFt || item.heightIn || item.depthFt)
        ? `Dimension 1: ${item.lengthFt || 0}ft ${item.lengthIn ? `${item.lengthIn}in` : ""} | Dimension 2: ${item.heightFt || 0}ft ${item.heightIn ? `${item.heightIn}in` : ""}${item.depthFt ? ` | Depth: ${item.depthFt}ft` : ""}`
        : "";
      const hardware = `Hardware (Channels, fittings): Onyx / Ebco`;

      const descParts = [];
      if (showItemName) {
        descParts.push(`${name}\n\n${spaceCategory}`);
      }
      if (showDescription) {
        descParts.push(`${description}\n${hardware}`);
      }
      if (showDimensions && dims) {
        descParts.push(dims);
      }

      const fullDesc = descParts.length > 0 ? descParts.join("\n\n") : (item.name || "Custom Component");
      const uom = item.uom || item.unit || "Sq. Ft";
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 1;
      const sqft = Number(item.sqft) || 0;
      const amount = Number(item.amount) !== undefined && !isNaN(Number(item.amount)) && Number(item.amount) > 0
        ? Number(item.amount)
        : (rate * (sqft || qty));

      const row = [];
      if (showSN) row.push(String(idx + 1));
      if (showMainDesc) row.push(fullDesc);
      if (showRefImage) row.push({ content: "", img: item._base64 });
      if (showUom) row.push(uom);
      if (showUnitRate) row.push(`Rs. ${rate.toLocaleString("en-IN")}`);
      if (showQuantity) row.push(String(qty));
      if (showPrice) row.push(`Rs. ${amount.toLocaleString("en-IN")}`);

      if (row.length === 0) row.push(name);
      return row;
    });

    autoTable(doc, {
      startY: currentY + 26,
      margin: { left: 40, right: 40 },
      head: [headCols],
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
      columnStyles: colStyles,
      didDrawCell: (data) => {
        if (data.section === "body" && imgColIndex !== -1 && data.column.index === imgColIndex && data.cell.raw?.img) {
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
  });;

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
    doc.text("For VELORA ANTARAAL LLP", 555, currentY + 16, { align: "right" });
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
    doc.text("+91 86055 26603 | +91 820-8732741  •  info@velora.family  •  https://velora.family  •  S. No. 242/1, Nr. Water Tank, Aundh Wakad Road, Wakad, Pune - 411033", 297.5, 814, { align: "center" });

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



  // 2. Bank Account Details & Payment QR Code
  const companySettings = getActiveCompanySettings();
  const currentUser = getCurrentUser() || { name: "Admin", role: "Super Admin" };

  const bankName = companySettings.bankName || tcTemplate.bankDetails?.bankName || "HDFC Bank Ltd";
  const accHolder = companySettings.accountHolderName || tcTemplate.bankDetails?.accountHolder || "VELORA INTERIORS PRIVATE LIMITED";
  const accNum = companySettings.accountNumber || tcTemplate.bankDetails?.accountNumber || "50200067891234";
  const ifsc = companySettings.ifscCode || tcTemplate.bankDetails?.ifsc || "HDFC0001234";
  const branch = companySettings.branch || tcTemplate.bankDetails?.branch || "Wakad, Pune";
  const accType = companySettings.accountType || tcTemplate.bankDetails?.accountType || "Current Account";
  const upiId = companySettings.upiId || "velora.interiors@hdfcbank";

  doc.setDrawColor(168, 50, 50);
  doc.setLineWidth(3);
  doc.line(40, currentY, 40, currentY + 62);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(168, 50, 50);
  doc.text("Bank Account Details & Payment QR", 48, currentY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(28, 25, 23);
  doc.text(`Bank Name: ${bankName}    |    Account Holder: ${accHolder}`, 48, currentY + 24);
  doc.text(`Account Number: ${accNum}    |    Account Type: ${accType}`, 48, currentY + 35);
  doc.text(`IFSC Code: ${ifsc}    |    Branch: ${branch}`, 48, currentY + 46);
  doc.text(`UPI ID: ${upiId}`, 48, currentY + 57);

  // Render QR Code image if configured
  if (companySettings.qrCodeUrl) {
    try {
      const qrDataUrl = await loadImageDataUrl(companySettings.qrCodeUrl);
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, "PNG", 485, currentY + 2, 60, 60);
      }
    } catch (e) {}
  }

  currentY += 76;

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

  const activeTermsList = companySettings.termsAndConditions?.termsList || tcTemplate.termsList;
  activeTermsList.forEach((item, idx) => {
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
  doc.text(companySettings.termsAndConditions?.note || tcTemplate.note || "Note : Debris removal / Deep cleaning charges shall be charged at actuals.( Borne by the client )", 40, currentY + 4);
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

  const activeMaterialDetails = companySettings.termsAndConditions?.materialDetails || tcTemplate.materialDetails;
  activeMaterialDetails.forEach((mat, mIdx) => {
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

  const activeWarrantyDetails = companySettings.termsAndConditions?.warrantyDetails || tcTemplate.warrantyDetails;
  activeWarrantyDetails.forEach((wText, wIdx) => {
    if (currentY > 780) {
      doc.addPage();
      currentY = 40;
    }
    const fullText = `${wIdx + 1}. ${wText}`;
    const lines = doc.splitTextToSize(fullText, 515);
    doc.text(lines, 40, currentY);
    currentY += (lines.length * 9.5) + 2;
  });

  // 6. Signatures and Prepared-By User Stamp
  if (currentY > 710) {
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
  doc.text("For VELORA ANTARAAL LLP", 555, currentY + 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signatory", 555, currentY + 38, { align: "right" });

  // User Prepared/Printed by Stamp
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108);
  doc.text(`Prepared & Printed by: ${currentUser?.name || "Admin"} (${currentUser?.role || "Staff"}) on ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`, 40, currentY + 44);

  doc.setDrawColor(212, 175, 55);
  doc.line(40, 788, 555, 788);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(158, 123, 29);
  doc.text("SPACES WITHIN, DESIGNED BEAUTIFULLY", 297.5, 802, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`${companySettings.phone || "+91 86055 26603"} | ${companySettings.altPhone || "+91 80555 26603"}  •  ${companySettings.email || "info@velora.family"}  •  ${companySettings.website || "https://velora.family"}  •  ${companySettings.address || "S. No. 242/1, Nr. Water Tank, Aundh Wakad Road, Wakad, Pune - 411033"}`, 297.5, 814, { align: "center" });

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
  const printCols = {
    ...DEFAULT_BOQ_PRINT_COLUMNS,
    ...(boq.printColumns || {}),
    ...(options.printColumns || {})
  };

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

  const allSpaces = Array.isArray(boq.spaces) ? boq.spaces : [];
  const populatedSpaces = allSpaces.filter((sp) => Array.isArray(sp.items) && sp.items.length > 0);
  const spaces = populatedSpaces.length > 0 ? populatedSpaces : allSpaces.filter((sp) => Number(sp.roomTotal) > 0);

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
  const gstPercent = boq.gstPercent !== undefined ? Number(boq.gstPercent) : 0;
  const cgstAmount = Math.round(taxableAmount * (gstPercent / 200));
  const sgstAmount = Math.round(taxableAmount * (gstPercent / 200));
  const gstTotal = cgstAmount + sgstAmount;
  const grandTotal = taxableAmount + gstTotal;

  const tcTemplate = getActiveTermsTemplate();

  const companySettings = getActiveCompanySettings();
  const currentUser = getCurrentUser() || { name: "Admin", role: "Super Admin" };
  const userStamp = `Prepared & Printed by: ${currentUser?.name || "Admin"} (${currentUser?.role || "Staff"}) on ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

  const bankName = companySettings.bankName || tcTemplate.bankDetails?.bankName || "HDFC Bank Ltd";
  const accHolder = companySettings.accountHolderName || tcTemplate.bankDetails?.accountHolder || "VELORA INTERIORS PRIVATE LIMITED";
  const accNum = companySettings.accountNumber || tcTemplate.bankDetails?.accountNumber || "50200067891234";
  const ifsc = companySettings.ifscCode || tcTemplate.bankDetails?.ifsc || "HDFC0001234";
  const branch = companySettings.branch || tcTemplate.bankDetails?.branch || "Wakad, Pune";
  const accType = companySettings.accountType || tcTemplate.bankDetails?.accountType || "Current Account";
  const upiId = companySettings.upiId || "velora.interiors@hdfcbank";
  const qrUrl = companySettings.qrCodeUrl || "";

  const bodyClasses = [
    !printCols.showSN ? "hide-sn" : "",
    !printCols.showItemName ? "hide-prod" : "",
    !printCols.showDescription ? "hide-desc" : "",
    !printCols.showDimensions ? "hide-dims" : "",
    !printCols.showRefImage ? "hide-ref" : "",
    !printCols.showUom ? "hide-uom" : "",
    !printCols.showUnitRate ? "hide-rate" : "",
    !printCols.showQuantity ? "hide-qty" : "",
    !printCols.showPrice ? "hide-price" : ""
  ].filter(Boolean).join(" ");

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
    .client-box {
      background: #faf6ed;
      border: 1.5px solid #d4af37;
      border-radius: 8px;
      padding: 12px 18px;
      flex: 1;
      max-width: 440px;
    }
    .client-box .prep-badge {
      display: inline-block;
      font-size: 9.5px;
      font-weight: 800;
      color: #9e7b1d;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 4px;
    }
    .client-box h2 {
      margin: 2px 0 6px 0;
      font-size: 20px;
      font-weight: 900;
      color: #1c1917;
      letter-spacing: -0.2px;
    }
    .client-box .client-meta-grid {
      display: grid;
      grid-template-columns: auto auto;
      gap: 4px 16px;
      font-size: 11.5px;
      color: #57534e;
      margin-top: 4px;
    }
    .client-box .client-meta-grid strong {
      color: #292524;
      font-weight: 700;
    }
    .brand-box {
      background: #faf6ed;
      border: 1.5px solid #d4af37;
      border-radius: 8px;
      padding: 12px 18px;
      flex: 1;
      max-width: 440px;
      text-align: right;
    }
    .brand-box .prep-badge {
      display: inline-block;
      font-size: 9.5px;
      font-weight: 800;
      color: #9e7b1d;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 4px;
    }
    .brand-box h1 {
      margin: 2px 0 6px 0;
      font-size: 20px;
      font-weight: 900;
      color: #c9a227;
      letter-spacing: 0.5px;
    }
    .brand-box .brand-meta-grid {
      font-size: 11.5px;
      color: #57534e;
      margin-top: 4px;
      line-height: 1.4;
    }
    .brand-box .brand-meta-grid strong {
      color: #292524;
      font-weight: 700;
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

    /* DYNAMIC COLUMN VISIBILITY CLASSES */
    .col-sn { display: table-cell; }
    .col-prod { display: block; }
    .col-desc { display: block; }
    .col-dims { display: block; }
    .col-ref { display: table-cell; }
    .col-uom { display: table-cell; }
    .col-rate { display: table-cell; }
    .col-qty { display: table-cell; }
    .col-price { display: table-cell; }

    body.hide-sn .col-sn { display: none !important; }
    body.hide-prod .col-prod { display: none !important; }
    body.hide-desc .col-desc, body.hide-desc .col-specs { display: none !important; }
    body.hide-dims .col-dims { display: none !important; }
    body.hide-ref .col-ref { display: none !important; }
    body.hide-uom .col-uom { display: none !important; }
    body.hide-rate .col-rate { display: none !important; }
    body.hide-qty .col-qty { display: none !important; }
    body.hide-price .col-price { display: none !important; }

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
      border: 2px solid #2563eb;
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
      background: #eff6ff;
      border-top: 2px solid #2563eb;
      border-bottom: none;
      font-weight: 900;
      font-size: 21px;
      color: #2563eb;
      padding: 14px 18px;
    }
    .tot-row.grand .tot-val {
      font-size: 22px;
      font-weight: 900;
    }
    .tot-words-bar {
      background: #eff6ff;
      padding: 6px 18px 12px 18px;
      text-align: right;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      border-top: 1px dashed #bfdbfe;
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
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1.5px solid #2563eb;
      text-align: center;
      font-size: 11px;
      color: #78716c;
      break-inside: avoid;
    }
    .footer-bar strong {
      color: #2563eb;
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
<body class="${bodyClasses}">
  <!-- Top Preview & Printing Control Bar -->
  <div class="no-print" style="background: #0f172a; color: #fff; padding: 12px 20px; display: flex; flex-direction: column; gap: 10px; position: sticky; top: 0; z-index: 999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <span style="font-weight: 900; font-size: 14px; color: #60a5fa; letter-spacing: 0.5px;">VELORA INTERIOR ESTIMATE & BOQ</span>
        <span style="color: #94a3b8; font-size: 12px;">| Choose Visible Columns & Print</span>
      </div>

      <!-- Live Action Buttons -->
      <div style="display: flex; align-items: center; gap: 12px;">
        <label style="display: inline-flex; align-items: center; gap: 6px; color: #f8fafc; font-size: 12px; font-weight: 700; cursor: pointer; background: #1e293b; padding: 6px 10px; border-radius: 8px; border: 1px solid #334155; user-select: none;">
          <input type="checkbox" id="tcToggle" ${includeTerms ? "checked" : ""} onchange="window.toggleTerms(this.checked)" style="width: 15px; height: 15px; accent-color: #c9a227; cursor: pointer;" />
          <span>Include T&C</span>
        </label>

        <button onclick="window.print()" style="background: #c9a227; color: #fff; border: none; padding: 7px 18px; border-radius: 8px; font-weight: 900; font-size: 12.5px; cursor: pointer; transition: background 0.2s;">
          Print / Save PDF
        </button>
        <button onclick="window.close()" style="background: #44403c; color: #fff; border: none; padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer;">
          Close
        </button>
      </div>
    </div>

    <!-- Live Column Chooser Toggle Pills -->
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 6px; border-top: 1px solid #334155; font-size: 11.5px;">
      <span style="color: #94a3b8; font-weight: 800; margin-right: 4px; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.5px;">Visible Columns:</span>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showSN !== false ? "checked" : ""} onchange="window.toggleColumn('sn', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>SN</span>
      </label>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showItemName !== false ? "checked" : ""} onchange="window.toggleColumn('prod', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>Item Name</span>
      </label>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showDimensions !== false ? "checked" : ""} onchange="window.toggleColumn('dims', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>Dimensions (Ft / In)</span>
      </label>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showDescription !== false ? "checked" : ""} onchange="window.toggleColumn('desc', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>Description & Specs</span>
      </label>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showRefImage !== false ? "checked" : ""} onchange="window.toggleColumn('ref', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>Image</span>
      </label>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showUom !== false ? "checked" : ""} onchange="window.toggleColumn('uom', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>UOM</span>
      </label>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showUnitRate !== false ? "checked" : ""} onchange="window.toggleColumn('rate', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>Rate (₹)</span>
      </label>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showQuantity !== false ? "checked" : ""} onchange="window.toggleColumn('qty', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>Qty</span>
      </label>

      <label style="display: inline-flex; align-items: center; gap: 5px; background: #1e293b; color: #e2e8f0; padding: 3px 8px; border-radius: 6px; border: 1px solid #475569; cursor: pointer; user-select: none;">
        <input type="checkbox" ${printCols.showPrice !== false ? "checked" : ""} onchange="window.toggleColumn('price', this.checked)" style="accent-color: #3b82f6; cursor: pointer;" />
        <span>Price (₹)</span>
      </label>
    </div>
  </div>

  <div class="page-container">
    <!-- Brand Header -->
    <div class="header-row">
      <div class="client-box">
        <span class="prep-badge">PREPARED EXCLUSIVELY FOR</span>
        <h2>${clientName}</h2>
        <div class="client-meta-grid">
          <div><strong>Project Site:</strong> ${siteLocation}</div>
          <div><strong>Date of Issue:</strong> ${formattedDate}</div>
          ${clientPhone && clientPhone !== "-" ? `<div><strong>Phone:</strong> ${clientPhone}</div>` : ""}
          ${clientEmail && clientEmail !== "-" ? `<div><strong>Email:</strong> ${clientEmail}</div>` : ""}
          <div><strong>Quotation Ref:</strong> ${boqNumber}</div>
        </div>
      </div>

      <div class="brand-box">
        <span class="prep-badge">PREPARED BY / COMPANY</span>
        <h1>VELORA ANTARAAL LLP</h1>
        <div class="brand-meta-grid">
          <div><strong>INTERIOR DESIGN | DÉCOR | RETAIL</strong></div>
          <div>S. No. 242/1, Nr. Water Tank, Aundh Wakad Rd, Pune - 411033</div>
          <div><strong>Phone:</strong> +91 80555 26603 / 77059 65556</div>
          <div><strong>Email / Web:</strong> info@velora.family | https://velora.family</div>
        </div>
      </div>
    </div>

    <!-- Space-by-Space Tables matching Image 1 to 4 -->
    ${spaces.map((space) => {
    const sItems = Array.isArray(space.items) && space.items.length > 0 ? space.items : [];
    if (sItems.length === 0) return "";

    return `
        <div class="space-block">
          <div class="space-title-bar">${space.name}</div>
          <table class="item-table">
            <thead>
              <tr>
                <th class="col-sn" style="width: 32px;">SN</th>
                <th class="col-main" style="text-align: left;">Item Description & Specification</th>
                <th class="col-ref" style="width: 80px;">Ref.</th>
                <th class="col-uom" style="width: 55px;">UOM</th>
                <th class="col-rate" style="width: 85px; text-align: right;">Unit Rate</th>
                <th class="col-qty" style="width: 38px;">Qty</th>
                <th class="col-price" style="width: 95px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${sItems.map((it, idx) => {
      const imgUrl = (it.photos && it.photos[0]?.url) || it.image || it.photos?.[0] || "";
      const rate = Number(it.rate) || 0;
      const qty = Number(it.qty) || 1;
      const sqft = Number(it.sqft) || 0;
      const amt = Number(it.amount) !== undefined && !isNaN(Number(it.amount)) && Number(it.amount) > 0
        ? Number(it.amount)
        : (rate * (sqft || qty));
      const dims = (it.lengthFt || it.lengthIn || it.heightFt || it.heightIn || it.depthFt)
        ? `Dimension 1: ${it.lengthFt || 0}ft ${it.lengthIn ? `${it.lengthIn}in` : ""} | Dimension 2: ${it.heightFt || 0}ft ${it.heightIn ? `${it.heightIn}in` : ""}${it.depthFt ? ` | Depth: ${it.depthFt}ft` : ""}`
        : "";

      return `
                  <tr>
                    <td class="col-sn" style="text-align: center; font-weight: 700;">${idx + 1}</td>
                    <td class="col-main">
                      <div class="item-name col-prod">${it.name || "Custom Component"}</div>
                      <div class="item-cat col-prod">${space.name.toUpperCase()} &gt; ${space.name.toUpperCase()} - Category: ${it.typeVariant || "Wood Work"}, Sub Category: ${it.packageVariant || "Standard"}</div>
                      <div class="item-desc col-desc">${it.description || `Providing and Installation ${it.name}, made in 18 mm thk Hardcore Triple A grade Okuma face Commercial plywood`}</div>
                      <div class="item-specs col-desc">Hardware (Channels, fittings): Onyx / Ebco / Hettich</div>
                      ${dims ? `<div class="item-specs col-dims" style="font-weight: 700; color: #991b1b; margin-top: 2px;">${dims}</div>` : ""}
                    </td>
                    <td class="col-ref" style="text-align: center;">
                      ${imgUrl ? `<img src="${imgUrl}" class="ref-img" alt="Image" onerror="this.style.display='none'" />` : `<div class="no-img">Ref. Image</div>`}
                    </td>
                    <td class="col-uom" style="text-align: center; font-weight: 600;">${it.uom || it.unit || "Sq. Ft"}</td>
                    <td class="col-rate" style="text-align: right; font-weight: 700;">₹ ${(rate).toLocaleString("en-IN")}</td>
                    <td class="col-qty" style="text-align: center; font-weight: 700;">${qty}</td>
                    <td class="col-price" style="text-align: right; font-weight: 900;">₹ ${(amt).toLocaleString("en-IN")}</td>
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
      <!-- Bank Account Details & Universal Payment QR -->
      <div class="bank-card" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
        <div>
          <h4>Bank Account Details</h4>
          <div class="bank-grid">
            <div>Bank Name: <strong>${bankName}</strong></div>
            <div>Account Holder: <strong>${accHolder}</strong></div>
            <div>Account Number: <strong>${accNum}</strong></div>
            <div>IFSC: <strong>${ifsc}</strong></div>
            <div>Branch: <strong>${branch}</strong></div>
            <div>Account Type: <strong>${accType}</strong></div>
            <div>UPI ID: <strong>${upiId}</strong></div>
          </div>
        </div>
        ${qrUrl ? `
          <div style="text-align: center; padding: 6px; background: #fff; border: 1px solid #d6d3d1; border-radius: 8px; min-width: 90px;">
            <img src="${qrUrl}" alt="Scan to Pay QR" style="width: 80px; height: 80px; object-fit: contain; display: block; margin: 0 auto;" />
            <div style="font-size: 10px; font-weight: 800; color: #1c1917; margin-top: 4px;">Scan to Pay</div>
          </div>
        ` : ""}
      </div>

      <!-- 3. Terms and Conditions (16 Clauses) -->
      <div class="accent-bar-title">Terms and Conditions</div>
      <ol class="tc-list">
        ${(companySettings.termsAndConditions?.termsList || tcTemplate.termsList).map((item) => `
          <li><strong>${item.title ? `${item.title}: ` : ""}</strong>${item.text}</li>
        `).join("")}
      </ol>

      <div class="tc-note-box">
        ${companySettings.termsAndConditions?.note || tcTemplate.note || "Note : Debris removal / Deep cleaning charges shall be charged at actuals.( Borne by the client )"}
      </div>

      <!-- 4. Material Details -->
      <div class="accent-bar-title" style="margin-top: 24px;">Material Details:</div>
      <ol class="tc-list">
        ${(companySettings.termsAndConditions?.materialDetails || tcTemplate.materialDetails).map((mat) => `
          <li><strong>${mat.title}: </strong>${mat.text}</li>
        `).join("")}
      </ol>

      <!-- 5. Warranty Details -->
      <div class="accent-bar-title" style="margin-top: 24px;">WARRANTY Details:</div>
      <ol class="tc-list">
        ${(companySettings.termsAndConditions?.warrantyDetails || tcTemplate.warrantyDetails).map((wText) => `
          <li>${wText}</li>
        `).join("")}
      </ol>

      <!-- Signatures Row inside T&C -->
      <div class="signatures-row">
        <div>
          <p style="font-weight: 600;">Client Acceptance Signature: ___________________________</p>
          <div style="font-size: 11px; font-style: italic; color: #78716c; margin-top: 6px;">${userStamp}</div>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 800; color: #c9a227; margin: 0;">For VELORA ANTARAAL LLP</p>
          <p style="margin: 30px 0 0 0; color: #57534e;">Authorized Signatory</p>
        </div>
      </div>

      <div class="footer-bar">
        <div><strong>SPACES WITHIN, DESIGNED BEAUTIFULLY</strong></div>
        <div>${companySettings.phone || "+91 86055 26603"} | ${companySettings.altPhone || "+91 820-8732741"}  •  ${companySettings.email || "info@velora.family"}  •  ${companySettings.website || "https://velora.family"}  •  ${companySettings.address || "S. No. 242/1, Nr. Water Tank, Aundh Wakad Road, Wakad, Pune - 411033"}</div>
      </div>
    </div>

    <!-- Signatures Row when T&C is excluded -->
    <div id="standalone-signatures" style="${includeTerms ? 'display: none;' : 'display: block;'}">
      <div class="signatures-row">
        <div>
          <p style="font-weight: 600;">Client Acceptance Signature: ___________________________</p>
          <div style="font-size: 11px; font-style: italic; color: #78716c; margin-top: 6px;">${userStamp}</div>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 800; color: #c9a227; margin: 0;">For VELORA ANTARAAL LLP</p>
          <p style="margin: 30px 0 0 0; color: #57534e;">Authorized Signatory</p>
        </div>
      </div>
      <div class="footer-bar">
        <div><strong>SPACES WITHIN, DESIGNED BEAUTIFULLY</strong></div>
        <div>${companySettings.phone || "+91 86055 26603"} | ${companySettings.altPhone || "+91 820-8732741"}  •  ${companySettings.email || "info@velora.family"}  •  ${companySettings.website || "https://velora.family"}  •  ${companySettings.address || "S. No. 242/1, Nr. Water Tank, Aundh Wakad Road, Wakad, Pune - 411033"}</div>
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

    window.toggleColumn = function(colName, show) {
      if (show) {
        document.body.classList.remove('hide-' + colName);
      } else {
        document.body.classList.add('hide-' + colName);
      }
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
 * Client-Side Luxury Invoice PDF Generator
 */
export const generateClientSideInvoicePdf = (invoice, isPrint = false) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const invNum = invoice?.invoiceNumber || "NCI006";
  const projName = invoice?.projectName || invoice?.clientName || "sai chauhan";
  const projNumber = invoice?.projectNumber || "PRJ-2026-012";
  const clientName = invoice?.billTo?.name || invoice?.clientName || invoice?.billedTo || "Valued Client";
  const clientEmail = invoice?.billTo?.email || invoice?.clientEmail || "";
  const clientPhone = invoice?.billTo?.phone || invoice?.clientPhone || "";
  const clientAddress = invoice?.billTo?.address || invoice?.clientAddress || "Pune, Maharashtra";

  const shipName = invoice?.shipTo?.name || (invoice?.sameAsBillTo ? clientName : clientName);
  const shipEmail = invoice?.shipTo?.email || (invoice?.sameAsBillTo ? clientEmail : clientEmail);
  const shipPhone = invoice?.shipTo?.phone || (invoice?.sameAsBillTo ? clientPhone : clientPhone);
  const shipAddress = invoice?.shipTo?.address || (invoice?.sameAsBillTo ? clientAddress : clientAddress);

  const grandTotal = Number(invoice?.totalAmount || invoice?.dueAmount || invoice?.grandTotal || 0);
  const subtotal = Number(invoice?.subTotal || invoice?.subtotal || grandTotal);
  const gstTotal = Number(invoice?.taxAmount || invoice?.gstTotal || 0);

  const primaryBlue = [37, 99, 235]; // Royal Blue #2563EB
  const gold = [37, 99, 235]; // Unified with Blue

  // --- PAGE 1: TAX INVOICE ---
  const issueDate = invoice?.enquiryDate || invoice?.issueDate || invoice?.createdAt || Date.now();
  const formattedDate = invoice?.formattedDate || invoice?.invoiceDate || new Date(issueDate).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
  const dueDate = invoice?.dueDate || "--";

  // Header Left: Prepared Exclusively For (Matching BOQ Yellow Dossier Card)
  doc.setFillColor(250, 246, 237);
  doc.roundedRect(40, 36, 255, 82, 4, 4, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.roundedRect(40, 36, 255, 82, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(158, 123, 29);
  doc.text("PREPARED EXCLUSIVELY FOR", 50, 50);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(28, 25, 23);
  doc.text(String(clientName).toUpperCase(), 50, 65);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(75, 70, 65);
  doc.text(`Project Site: ${clientAddress}`, 50, 78);
  if (clientPhone) {
    doc.text(`Phone: (+91) ${clientPhone}  |  Date: ${formattedDate}`, 50, 90);
    doc.text(`Invoice No: ${invNum}  |  PID: ${projNumber}`, 50, 102);
  } else {
    doc.text(`Date: ${formattedDate}  |  Invoice No: ${invNum}`, 50, 90);
    doc.text(`Project Ref (PID): ${projNumber}  |  Due: ${dueDate}`, 50, 102);
  }

  // Header Right: Prepared By / Company (Matching BOQ Yellow Dossier Card)
  doc.setFillColor(250, 246, 237);
  doc.roundedRect(305, 36, 250, 82, 4, 4, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.roundedRect(305, 36, 250, 82, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(158, 123, 29);
  doc.text("PREPARED BY / COMPANY", 545, 50, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(201, 162, 39); // Luxury Gold
  doc.text("VELORA ANTARAAL LLP", 545, 65, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108);
  doc.text("INTERIOR DESIGN | DÉCOR | TURNKEY EXECUTION", 545, 76, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(75, 70, 65);
  doc.text("Shop No. 242/2/B1, Wakad, Pune - 411057", 545, 87, { align: "right" });
  doc.text("Phone: +91 86055 26603 / 80555 26603", 545, 97, { align: "right" });
  doc.text("GSTIN: 27CHCPS9945R1Z4  |  PAN: CHCPS9945R", 545, 107, { align: "right" });

  // TAX INVOICE Title Divider
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(28, 25, 23);
  doc.text("TAX INVOICE", 40, 134);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.text("ORIGINAL FOR RECIPIENT", 555, 134, { align: "right" });

  doc.setDrawColor(28, 25, 23);
  doc.setLineWidth(1);
  doc.line(40, 139, 555, 139);

  // Line Items Table
  const rawItems = (invoice?.items && invoice.items.length > 0)
    ? invoice.items
    : [
      { serviceDescription: "Interior Design & Turnkey Execution", hsnSac: "9954", quantity: 1, unit: "LS", rate: grandTotal || 65000, gstPercent: 0, gstAmount: 0, total: grandTotal || 65000 }
    ];

  const tableBody = rawItems.map((it, idx) => [
    String(idx + 1),
    it.serviceDescription || it.productName || it.name || "Interior Execution Item",
    it.hsnSac || "9954",
    String(it.quantity || 1),
    String(it.unit || it.uom || "Nos"),
    `Rs. ${(Number(it.rate) || 0).toLocaleString("en-IN")}`,
    `${it.gstPercent || 0}%`,
    `Rs. ${(Number(it.gstAmount) || 0).toLocaleString("en-IN")}`,
    `Rs. ${(Number(it.total) || Number(it.rate) || 0).toLocaleString("en-IN")}`
  ]);

  autoTable(doc, {
    startY: 147,
    margin: { left: 40, right: 40 },
    head: [["SN", "Service Description", "HSN/SAC", "Qty", "Unit", "Rate", "GST %", "GST (Rs)", "Total Amount"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [28, 25, 23], // Neutral Charcoal / Stone 900 (No Blue)
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [28, 25, 23],
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 24, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 155, fontStyle: "bold" },
      2: { cellWidth: 48, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
      4: { cellWidth: 35, halign: "center" },
      5: { cellWidth: 60, halign: "right" },
      6: { cellWidth: 38, halign: "center" },
      7: { cellWidth: 55, halign: "right" },
      8: { cellWidth: 70, halign: "right", fontStyle: "bold" }
    }
  });

  let finalY = (doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 360);

  // Commercial Totals Section (Right Aligned)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 70, 65);
  doc.text("Sub Total (Taxable)", 390, finalY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text(`Rs. ${subtotal.toLocaleString("en-IN")}`, 555, finalY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 70, 65);
  doc.text("Tax Amount (GST)", 390, finalY + 14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text(`Rs. ${gstTotal.toLocaleString("en-IN")}`, 555, finalY + 14, { align: "right" });

  // Warm Amber Total Value Box (Exact match to User Image)
  doc.setFillColor(250, 246, 237);
  doc.rect(380, finalY + 22, 175, 26, "F");
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.rect(380, finalY + 22, 175, 26, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9);
  doc.text("Total Value", 388, finalY + 38);
  doc.setFontSize(11);
  doc.text(`Rs. ${grandTotal.toLocaleString("en-IN")}`, 548, finalY + 38, { align: "right" });

  // Amount in Words
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(28, 25, 23);
  doc.text(`Amount in Words: ${numberToWordsIN(grandTotal)}`, 40, finalY + 38);

  // Bank Details & Scan to Pay (Left Column)
  let bankY = finalY + 58;
  if (bankY > 670) {
    doc.addPage();
    bankY = 40;
  }

  doc.setFillColor(250, 246, 237);
  doc.roundedRect(40, bankY, 410, 68, 4, 4, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.roundedRect(40, bankY, 410, 68, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(158, 123, 29);
  doc.text("BANK DETAILS & PAYMENT INSTRUCTIONS", 50, bankY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("Account Holder: VELORA ANTARAAL", 50, bankY + 27);
  doc.text("Account Number: 50200073374185", 50, bankY + 38);
  doc.text("IFSC Code: HDFC0000282    |    Branch: WAKAD, PUNE", 50, bankY + 49);
  doc.text("Bank Name: HDFC Bank      |    Account Type: Current Account", 50, bankY + 60);

  // Scan to pay Box
  let qrX = 465;
  let qrY = bankY;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX, qrY, 90, 68, 4, 4, "F");
  doc.setDrawColor(212, 175, 55);
  doc.roundedRect(qrX, qrY, 90, 68, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(158, 123, 29);
  doc.text("Scan to Pay (UPI)", qrX + 45, qrY + 12, { align: "center" });

  if (invoice?.paymentQrCode && invoice.paymentQrCode.startsWith("data:image")) {
    try {
      doc.addImage(invoice.paymentQrCode, "JPEG", qrX + 18, qrY + 16, 54, 48);
    } catch (e) {
      doc.setFontSize(7);
      doc.text("PhonePe / UPI", qrX + 45, qrY + 40, { align: "center" });
    }
  } else {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9);
    doc.text("PhonePe / UPI", qrX + 45, qrY + 35, { align: "center" });
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 113, 108);
    doc.text("ACCEPTED HERE", qrX + 45, qrY + 47, { align: "center" });
  }

  // Notes Box
  let notesY = bankY + 76;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(28, 25, 23);
  doc.text("Notes / Declaration:", 40, notesY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(75, 70, 65);
  doc.text(invoice?.notes || "Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.", 40, notesY + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(invoice?.notes || "Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.", 40, notesY + 11);

  // --- PAGE 2: TERMS & CONDITIONS ---
  doc.addPage();
  doc.setFillColor(254, 243, 199);
  doc.rect(40, 35, 515, 24, "F");
  doc.setDrawColor(217, 119, 6);
  doc.rect(40, 35, 515, 24, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text("TERMS & CONDITIONS — VELORA ANTARAAL", 48, 51);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("For Interior Design & Turnkey Execution Services", 40, 72);

  let p2Y = 88;
  const printTermBlock = (title, contentLines) => {
    if (p2Y > 740) {
      doc.addPage();
      p2Y = 40;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 40, p2Y);
    p2Y += 11;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    contentLines.forEach((l) => {
      if (p2Y > 750) {
        doc.addPage();
        p2Y = 40;
      }
      const split = doc.splitTextToSize(l, 515);
      doc.text(split, 40, p2Y);
      p2Y += (split.length * 9) + 2;
    });
    p2Y += 6;
  };

  printTermBlock("1. Scope of Work", [
    "The scope of work includes interior design consultancy, space planning, material selection, 2D/3D drawings, modular furniture design, civil execution, electrical work, false ceiling, and turnkey execution as agreed in the final quotation/work order.",
    "Any work outside the approved quotation shall be treated as additional work and billed separately."
  ]);

  printTermBlock("2. Design & Execution Process", [
    "1. Initial consultation & site survey  |  2. 2D Concept design & layout planning  |  3. 3D Renders & material selection  |  4. Execution signoff & handover."
  ]);

  printTermBlock("3. Quotation & Pricing", [
    "- All quotations are valid for 15 days from the date of issue.",
    "- Prices are based on approved specifications and current market material rates.",
    "- Customizations requested after final approval will be charged additionally."
  ]);

  printTermBlock("4. Payment Schedule", [
    "- 10% Advance – Booking & Design Initiation",
    "- 40% – Before Factory Production / Execution Commencement",
    "- 40% – During Site Execution Stage",
    "- 10% – Before Final Handover & Clearance"
  ]);

  printTermBlock("5. Project Timeline & Delays", [
    "- Timelines are estimated based on project scope and site readiness.",
    "- Delays caused due to civil issues, client-side approvals, vendor delays, or force majeure events shall not be company liability."
  ]);

  printTermBlock("6. Modular Furniture Warranty", [
    "- 5-Year warranty for modular furniture manufacturing defects.",
    "- Hardware warranty shall be as per respective brand manufacturer policy (Ebco, Hettich, etc.).",
    "- Moisture damage, seepage from existing structure, or unauthorized modifications are excluded."
  ]);

  printTermBlock("7. Dispute Resolution & Jurisdiction", [
    "Any disputes arising shall be subject to the exclusive jurisdiction of Pune, Maharashtra courts only."
  ]);

  // Signatures Section
  if (p2Y > 680) {
    doc.addPage();
    p2Y = 40;
  } else {
    p2Y += 12;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(40, p2Y, 555, p2Y);
  p2Y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Client Acceptance Signature: _______________________", 40, p2Y);
  doc.text("Date: _______________________", 40, p2Y + 16);

  doc.setFont("helvetica", "bold");
  doc.text("For VELORA ANTARAAL", 555, p2Y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signatory", 555, p2Y + 22, { align: "right" });

  doc.setDrawColor(217, 119, 6);
  doc.line(40, 788, 555, 788);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text("SPACES WITHIN, DESIGNED BEAUTIFULLY", 297.5, 802, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("+91 86055 26603  •  info@velora.family  •  https://velora.family  •  Wakad, Pune, Maharashtra", 297.5, 814, { align: "center" });

  doc.save(`Tax_Invoice_${invNum}.pdf`);
};

/**
 * Universal Download Function for Invoice PDF
 */
export const downloadInvoicePdf = async (invoiceOrId, customFilename) => {
  const id = typeof invoiceOrId === "object" ? (invoiceOrId?._id || invoiceOrId?.invoiceNumber) : invoiceOrId;
  const filename = customFilename || (typeof invoiceOrId === "object" ? `Tax_Invoice_${invoiceOrId?.invoiceNumber || "Invoice"}.pdf` : `Tax_Invoice_${id}.pdf`);

  // Instant client-side download if full object is passed
  if (typeof invoiceOrId === "object" && (invoiceOrId.clientName || invoiceOrId.invoiceNumber || invoiceOrId.billTo)) {
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

  const invData = typeof invoiceOrId === "object" ? invoiceOrId : { invoiceNumber: String(id), clientName: "Valued Client", grandTotal: 65000 };
  generateClientSideInvoicePdf(invData, false);
};

/**
 * Direct High-Resolution Print / Save as PDF Function for Tax Invoices
 */
export const printInvoice = (invoiceOrId, options = {}) => {
  if (!invoiceOrId) return;

  const invoice = typeof invoiceOrId === "object" ? invoiceOrId : { invoiceNumber: String(invoiceOrId) };
  const includeTerms = options.includeTerms !== false;
  const invNum = invoice.invoiceNumber || "NCI006";
  const clientName = invoice.billTo?.name || invoice.clientName || invoice.billedTo || "Valued Client";
  const clientPhone = invoice.billTo?.phone || invoice.clientPhone || "";
  const clientEmail = invoice.billTo?.email || invoice.clientEmail || "";
  const clientAddress = invoice.billTo?.address || invoice.clientAddress || "Pune, Maharashtra";

  const shipName = invoice.shipTo?.name || (invoice.sameAsBillTo ? clientName : clientName);
  const shipPhone = invoice.shipTo?.phone || (invoice.sameAsBillTo ? clientPhone : clientPhone);
  const shipEmail = invoice.shipTo?.email || (invoice.sameAsBillTo ? clientEmail : clientEmail);
  const shipAddress = invoice.shipTo?.address || (invoice.sameAsBillTo ? clientAddress : clientAddress);

  const projName = invoice.projectName || invoice.clientName || clientName;
  const projNumber = invoice.projectNumber || "PRJ-2026-012";
  const formattedDate = invoice.formattedDate || invoice.invoiceDate || new Date().toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
  const dueDate = invoice.dueDate || "--";

  const grandTotal = Number(invoice.totalAmount || invoice.dueAmount || invoice.grandTotal || 0);
  const subtotal = Number(invoice.subTotal || invoice.subtotal || grandTotal);
  const gstTotal = Number(invoice.taxAmount || invoice.gstTotal || 0);
  const taxPercent = invoice.taxPercent || 0;

  const rawItems = (invoice.items && invoice.items.length > 0)
    ? invoice.items
    : [
      { serviceDescription: "Interior Design & Turnkey Execution", hsnSac: "9954", quantity: 1, unit: "LS", rate: grandTotal || 65000, gstPercent: 0, gstAmount: 0, total: grandTotal || 65000 }
    ];

  const paymentQrCode = invoice.paymentQrCode || localStorage.getItem("velora_payment_qr_code") || "";

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print / save invoice as PDF.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax_Invoice_${invNum}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
    @page {
      size: A4;
      margin: 8mm 10mm;
    }
    body {
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #000000;
      margin: 0;
      padding: 0;
      font-size: 13px;
      line-height: 1.45;
      background: #fff;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 18px;
      box-sizing: border-box;
      border: 2px solid #000000;
      position: relative;
    }
    .header-dossier-wrap {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
    }
    .dossier-card {
      background: #faf6ed;
      border: 1.5px solid #d4af37;
      border-radius: 8px;
      padding: 12px 16px;
      flex: 1;
      min-width: 0;
    }
    .dossier-card.right {
      text-align: right;
    }
    .dossier-badge {
      font-size: 9px;
      font-weight: 900;
      color: #9e7b1d;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
      display: block;
    }
    .dossier-title {
      font-size: 16px;
      font-weight: 900;
      color: #1c1917;
      margin: 0 0 4px 0;
      line-height: 1.2;
    }
    .dossier-title.gold {
      color: #c9a227;
    }
    .dossier-subtitle {
      font-size: 9.5px;
      font-weight: 800;
      color: #78716c;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .dossier-body {
      font-size: 11px;
      color: #44403c;
      line-height: 1.45;
      font-weight: 600;
    }
    .dossier-body strong {
      color: #1c1917;
      font-weight: 800;
    }
    .invoice-title-divider {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 12px 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 2px solid #1c1917;
    }
    .invoice-main-heading {
      font-size: 18px;
      font-weight: 900;
      color: #1c1917;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .invoice-sub-heading {
      font-size: 11px;
      font-weight: 800;
      color: #78716c;
      text-transform: uppercase;
    }
    table.invoice-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #1c1917;
      margin-bottom: 12px;
      font-size: 12px;
    }
    table.invoice-table th {
      background: #1c1917;
      color: #ffffff;
      padding: 8px 10px;
      font-weight: 900;
      border: 1px solid #292524;
      font-size: 11.5px;
      letter-spacing: 0.3px;
    }
    table.invoice-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      color: #1c1917;
      vertical-align: middle;
      font-weight: 600;
    }
    table.invoice-table tr:nth-child(even) {
      background: #fafaf9;
    }
    .totals-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 10px;
      margin-bottom: 14px;
      gap: 20px;
    }
    .words-box {
      font-size: 12px;
      color: #1c1917;
      background: #ffffff;
      padding: 4px 0;
      flex: 1;
      font-weight: 600;
    }
    .words-box strong {
      color: #1c1917;
      font-weight: 900;
    }
    .summary-card {
      width: 300px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12.5px;
      font-weight: 700;
      color: #44403c;
    }
    .summary-row .val {
      font-weight: 900;
      color: #1c1917;
      font-family: monospace;
    }
    .total-value-box {
      border: 1.5px solid #d97706;
      background: #faf6ed;
      border-radius: 4px;
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
    }
    .total-value-box .label {
      font-size: 14px;
      font-weight: 900;
      color: #b45309;
    }
    .total-value-box .amt {
      font-size: 16px;
      font-weight: 900;
      color: #b45309;
      font-family: monospace;
    }
    .bottom-info-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 14px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1.5px solid #d4af37;
    }
    .bank-card {
      border: 1.5px solid #d4af37;
      background: #faf6ed;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 11.5px;
      color: #1c1917;
    }
    .bank-card h4 {
      margin: 0 0 6px 0;
      font-size: 11.5px;
      color: #9e7b1d;
      font-weight: 900;
      text-transform: uppercase;
    }
    .bank-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 12px;
      font-size: 11px;
      color: #44403c;
      font-weight: 600;
    }
    .bank-grid strong {
      color: #1c1917;
      font-weight: 800;
    }
    .qr-card {
      border: 1.5px solid #d4af37;
      border-radius: 8px;
      padding: 8px;
      text-align: center;
      background: #faf6ed;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .qr-card img {
      width: 75px;
      height: 75px;
      object-fit: contain;
      border-radius: 6px;
    }
    .qr-card .qr-fallback {
      width: 75px;
      height: 75px;
      background: #ffffff;
      border: 1px dashed #d4af37;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 800;
      color: #b45309;
    }
    .tc-page-container {
      page-break-before: always;
      break-before: page;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px dashed #cbd5e1;
    }
    .tc-header {
      font-size: 15px;
      font-weight: 900;
      color: #b45309;
      background: #faf6ed;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid #d97706;
      margin-bottom: 12px;
    }
    .tc-list {
      font-size: 11.5px;
      line-height: 1.55;
      color: #334155;
      padding-left: 18px;
      margin: 0 0 16px 0;
    }
    .tc-list li {
      margin-bottom: 8px;
    }
    .signatures-row {
      display: flex;
      justify-content: space-between;
      margin-top: 36px;
      padding-top: 12px;
      font-size: 12px;
      break-inside: avoid;
    }
    .footer-bar {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1.5px solid #d97706;
      text-align: center;
      font-size: 10.5px;
      color: #78716c;
      break-inside: avoid;
    }
    .footer-bar strong {
      color: #b45309;
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
  <div class="no-print" style="background: #1c1917; color: #fff; padding: 10px 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 999; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 900; font-size: 13.5px; color: #f59e0b; letter-spacing: 0.5px;">VELORA TAX INVOICE (${invNum})</span>
      <span style="color: #a8a29e; font-size: 11.5px;">| Print or Select "Save as PDF"</span>
    </div>

    <!-- Live In-Preview T&C Toggle Switch -->
    <div style="display: flex; align-items: center; gap: 14px;">
      <label style="display: inline-flex; align-items: center; gap: 8px; color: #f8fafc; font-size: 12px; font-weight: 700; cursor: pointer; background: #292524; padding: 6px 12px; border-radius: 8px; border: 1px solid #44403c; user-select: none;">
        <input type="checkbox" id="tcToggle" ${includeTerms ? "checked" : ""} onchange="window.toggleTerms(this.checked)" style="width: 15px; height: 15px; accent-color: #f59e0b; cursor: pointer;" />
        <span>Include Terms & Conditions (T&C)</span>
      </label>

      <button onclick="window.print()" style="background: #d97706; color: #fff; border: none; padding: 7px 18px; border-radius: 8px; font-weight: 900; font-size: 12px; cursor: pointer; transition: background 0.2s;">
        Print / Save PDF
      </button>
      <button onclick="window.close()" style="background: #44403c; color: #fff; border: none; padding: 7px 14px; border-radius: 8px; font-size: 11.5px; cursor: pointer;">
        Close
      </button>
    </div>
  </div>

  <div class="page-container">
    <!-- Header Row with Exact Yellow BOQ Dossier Cards -->
    <div class="header-dossier-wrap">
      <!-- Left Dossier Card: Prepared Exclusively For -->
      <div class="dossier-card">
        <span class="dossier-badge">PREPARED EXCLUSIVELY FOR</span>
        <h2 class="dossier-title">${clientName.toUpperCase()}</h2>
        <div class="dossier-body">
          <div><strong>Project Site:</strong> ${clientAddress}</div>
          ${clientPhone ? `<div><strong>Phone:</strong> (+91) ${clientPhone}</div>` : ''}
          ${clientEmail ? `<div><strong>Email:</strong> ${clientEmail}</div>` : ''}
          <div><strong>Date:</strong> ${formattedDate} &nbsp;|&nbsp; <strong>Due Date:</strong> ${dueDate}</div>
          <div><strong>Invoice No:</strong> ${invNum} &nbsp;|&nbsp; <strong>Project PID:</strong> ${projNumber}</div>
        </div>
      </div>

      <!-- Right Dossier Card: Prepared By / Company -->
      <div class="dossier-card right">
        <span class="dossier-badge">PREPARED BY / COMPANY</span>
        <h2 class="dossier-title gold">VELORA ANTARAAL LLP</h2>
        <div class="dossier-subtitle">INTERIOR DESIGN | DÉCOR | TURNKEY EXECUTION</div>
        <div class="dossier-body">
          <div>Shop No. 242/2/B1, Bafna Niwas, Aundh Wakad Rd, Pune - 411057</div>
          <div><strong>Phone:</strong> +91 86055 26603 / 80555 26603</div>
          <div><strong>Email:</strong> info@velora.family &nbsp;|&nbsp; <strong>Web:</strong> https://velora.family</div>
          <div><strong>GSTIN:</strong> 27CHCPS9945R1Z4 &nbsp;|&nbsp; <strong>PAN:</strong> CHCPS9945R</div>
        </div>
      </div>
    </div>

    <!-- Title Divider -->
    <div class="invoice-title-divider">
      <h1 class="invoice-main-heading">TAX INVOICE</h1>
      <span class="invoice-sub-heading">ORIGINAL FOR RECIPIENT</span>
    </div>

    <!-- Line Items Table (Exact Columns as User Screenshot, Clean Dark/Stone Style without Blue) -->
    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width: 32px; text-align: center;">SN</th>
          <th style="text-align: left;">Service Description</th>
          <th style="width: 70px; text-align: center;">HSN/SAC</th>
          <th style="width: 45px; text-align: center;">Qty</th>
          <th style="width: 50px; text-align: center;">Unit</th>
          <th style="width: 85px; text-align: right;">Rate</th>
          <th style="width: 55px; text-align: center;">GST %</th>
          <th style="width: 80px; text-align: right;">GST (Rs)</th>
          <th style="width: 95px; text-align: right;">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rawItems.map((it, idx) => {
    const rate = Number(it.rate) || 0;
    const qty = Number(it.quantity || it.qty) || 1;
    const gstP = Number(it.gstPercent) || 0;
    const gstA = Number(it.gstAmount) || 0;
    const tot = Number(it.total) || (rate * qty + gstA);

    return `
            <tr>
              <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
              <td>
                <div style="font-weight: 800; color: #1c1917;">${it.serviceDescription || it.productName || it.name || "Interior Scope"}</div>
                ${it.description ? `<div style="font-size: 10.5px; color: #78716c; margin-top: 2px;">${it.description}</div>` : ""}
              </td>
              <td style="text-align: center; font-family: monospace; color: #57534e;">${it.hsnSac || "9954"}</td>
              <td style="text-align: center; font-weight: 800;">${qty}</td>
              <td style="text-align: center; color: #57534e;">${it.unit || it.uom || "Nos"}</td>
              <td style="text-align: right; font-weight: 700;">Rs. ${(rate).toLocaleString("en-IN")}</td>
              <td style="text-align: center; font-weight: 700;">${gstP}%</td>
              <td style="text-align: right; color: #57534e;">Rs. ${(gstA).toLocaleString("en-IN")}</td>
              <td style="text-align: right; font-weight: 900; color: #1c1917;">Rs. ${(tot).toLocaleString("en-IN")}</td>
            </tr>
          `;
  }).join("")}
      </tbody>
    </table>

    <!-- Commercial Totals & Amount in Words (Exact Match to User Screenshot) -->
    <div class="totals-wrap">
      <div class="words-box">
        <div><strong>Amount in Words:</strong> ${numberToWordsIN(grandTotal)}</div>
        <div style="margin-top: 6px; font-size: 11px; color: #78716c;">
          <strong>Notes:</strong> ${invoice.notes || "Registered under Composition Taxable scheme. Not eligible to collect tax on supplies."}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-row">
          <span>Sub Total (Taxable)</span>
          <span class="val">Rs. ${(subtotal).toLocaleString("en-IN")}</span>
        </div>
        <div class="summary-row">
          <span>Tax Amount (GST)</span>
          <span class="val">Rs. ${(gstTotal).toLocaleString("en-IN")}</span>
        </div>
        <div class="total-value-box">
          <span class="label">Total Value</span>
          <span class="amt">Rs. ${(grandTotal).toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>

    <!-- Bank Details & Payment Instructions + QR Code (No Blue) -->
    <div class="bottom-info-grid">
      <div class="bank-card">
        <h4>Bank Details & Payment Instructions</h4>
        <div class="bank-grid">
          <div>Account Holder: <strong>VELORA ANTARAAL</strong></div>
          <div>Account Number: <strong>50200073374185</strong></div>
          <div>IFSC Code: <strong>HDFC0000282</strong></div>
          <div>Branch: <strong>WAKAD, PUNE</strong></div>
          <div>Bank Name: <strong>HDFC Bank</strong></div>
          <div>Account Type: <strong>Current Account</strong></div>
        </div>
      </div>

      <div class="qr-card">
        <div style="font-size: 10.5px; font-weight: 900; color: #9e7b1d; margin-bottom: 3px; text-transform: uppercase;">Scan to Pay (UPI)</div>
        ${paymentQrCode ? `
          <img src="${paymentQrCode}" alt="PhonePe QR Code" onerror="this.style.display='none'" />
        ` : `
          <div class="qr-fallback">
            <span style="font-size: 13px;">📱</span>
            <span>PhonePe / UPI</span>
            <span style="font-size: 7.5px; color: #78716c;">ACCEPTED HERE</span>
          </div>
        `}
      </div>
    </div>

    <!-- DEDICATED TERMS & CONDITIONS SECTION -->
    <div id="tc-page-section" class="tc-page-container" style="${includeTerms ? '' : 'display: none;'}">
      <div class="tc-header">TERMS & CONDITIONS — VELORA ANTARAAL</div>
      <ol class="tc-list">
        <li><strong>1. Scope of Work: </strong>The scope of work includes interior design consultancy, space planning, material selection, 2D/3D drawings, modular furniture design, civil execution, electrical work, false ceiling, and turnkey execution as agreed in the final quotation/work order. Any work outside the approved quotation shall be treated as additional work and billed separately.</li>
        <li><strong>2. Design & Execution Process: </strong>1. Initial consultation & site survey | 2. Concept design and layout planning | 3. 3D Visualization & material selection | 4. Execution signoff and project handover.</li>
        <li><strong>3. Quotation & Pricing: </strong>All quotations are valid for 15 days from the date of issue. Prices are based on current market rates of materials and labour. Customizations requested after final approval will be charged additionally.</li>
        <li><strong>4. Payment Terms: </strong>10% Advance (Booking & Design Initiation) | 40% (Before Factory Production / Execution) | 40% (During Site Execution Stage) | 10% (Before Final Handover). All payments must be made as per agreed timelines.</li>
        <li><strong>5. Project Timeline: </strong>Timelines are estimated based on project scope and site conditions. Delays caused due to civil issues, client-side approvals, vendor delays, or force majeure events shall not be company liability.</li>
        <li><strong>6. Modular Furniture Warranty: </strong>5-Year warranty for modular furniture manufacturing defects. Hardware warranty shall be as per respective brand manufacturer policy (Ebco, Hettich, etc.). Moisture damage or unauthorized modifications are not covered.</li>
        <li><strong>7. Ownership & Intellectual Property: </strong>All drawings, 3D renders, and designs remain intellectual property of VELORA ANTARAAL unless agreed otherwise in writing.</li>
        <li><strong>8. Dispute Resolution: </strong>Any disputes arising shall be subject to the jurisdiction of Pune, Maharashtra courts only.</li>
      </ol>

      <div class="signatures-row">
        <div>
          <p style="font-weight: 600;">Client Acceptance Signature: ___________________________</p>
          <p style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: ___________________________</p>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 800; color: #b45309; margin: 0;">For VELORA ANTARAAL</p>
          <p style="margin: 28px 0 0 0; color: #475569;">Authorized Signatory</p>
        </div>
      </div>

      <div class="footer-bar">
        <div><strong>SPACES WITHIN, DESIGNED BEAUTIFULLY</strong></div>
        <div>+91 86055 26603 | +91 80555 26603  •  info@velora.family  •  https://velora.family  •  Wakad, Pune, Maharashtra, India</div>
      </div>
    </div>

    <!-- Signatures Row when T&C is excluded -->
    <div id="standalone-signatures" style="${includeTerms ? 'display: none;' : 'display: block;'}">
      <div class="signatures-row">
        <div>
          <p style="font-weight: 600;">Client Acceptance Signature: ___________________________</p>
          <p style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: ___________________________</p>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 800; color: #b45309; margin: 0;">For VELORA ANTARAAL</p>
          <p style="margin: 28px 0 0 0; color: #475569;">Authorized Signatory</p>
        </div>
      </div>
      <div class="footer-bar">
        <div><strong>SPACES WITHIN, DESIGNED BEAUTIFULLY</strong></div>
        <div>+91 86055 26603 | +91 80555 26603  •  info@velora.family  •  https://velora.family  •  Wakad, Pune, Maharashtra, India</div>
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

/**
 * Client-Side Luxury Payment History & Financial Statement PDF Generator
 */
export const downloadPaymentHistoryPdf = (projectOrClient, options = {}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  const clientName = projectOrClient?.clientName || projectOrClient?.name || "Valued Client";
  const clientPhone = projectOrClient?.clientPhone || projectOrClient?.phone || "-";
  const clientEmail = projectOrClient?.clientEmail || projectOrClient?.email || "-";
  const siteAddress = projectOrClient?.siteLocation || projectOrClient?.address || projectOrClient?.siteAddress || "Pune, Maharashtra";
  const projectNumber = projectOrClient?.projectNumber || projectOrClient?.enquiryNo || "PRJ-2026";
  const projectType = projectOrClient?.projectType || "Residential Turnkey";
  const preferredStyle = projectOrClient?.preferredStyle || "Modern Contemporary";
  const handledBy = projectOrClient?.handledBy || "Velora Lead Consultant";

  const totalEstimate = Number(projectOrClient?.budget || 0);
  const paymentList = Array.isArray(projectOrClient?.payments) ? projectOrClient.payments : [];
  const totalReceived = paymentList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingBalance = Math.max(0, totalEstimate - totalReceived);
  const percentPaid = totalEstimate > 0 ? Math.min(100, Math.round((totalReceived / totalEstimate) * 100)) : 0;
  const paymentStatus = (totalEstimate > 0 && pendingBalance === 0) ? "FULLY PAID" : (totalReceived > 0 ? `PARTIALLY PAID (${percentPaid}%)` : "PAYMENT PENDING");

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  // 1. Top Gold Brand Accent Bar
  doc.setFillColor(197, 160, 89);
  doc.rect(margin, 30, contentWidth, 4, "F");

  // 2. Brand Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(158, 123, 29); // Velora Gold
  doc.text("VELORA LUXURY INTERIORS", margin, 58);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("CLIENT PAYMENT STATEMENT & FINANCIAL LEDGER", margin, 73);

  // Right Header Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`STATEMENT REF: ${projectNumber}`, pageWidth - margin, 55, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`DATE GENERATED: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, pageWidth - margin, 70, { align: "right" });

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, 85, pageWidth - margin, 85);

  // 3. Client & Project Details Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 95, contentWidth, 75, 6, 6, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 95, contentWidth, 75, 6, 6, "S");

  // Left Column - Client Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("BILLED TO / CLIENT:", margin + 15, 112);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(clientName.toUpperCase(), margin + 15, 128);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${clientPhone}  |  Email: ${clientEmail}`, margin + 15, 143);
  doc.text(`Site Address: ${siteAddress}`, margin + 15, 157);

  // Right Column - Project Info
  const rightColX = margin + (contentWidth / 2) + 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("PROJECT SCOPE & CONSULTANT:", rightColX, 112);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`${projectType} (${preferredStyle})`, rightColX, 128);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Designated Lead: ${handledBy}`, rightColX, 143);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(paymentStatus.includes("FULLY") ? 5 : (paymentStatus.includes("PARTIALLY") ? 37 : 180), paymentStatus.includes("FULLY") ? 150 : (paymentStatus.includes("PARTIALLY") ? 99 : 83), paymentStatus.includes("FULLY") ? 105 : (paymentStatus.includes("PARTIALLY") ? 235 : 9));
  doc.text(`Account Status: ${paymentStatus}`, rightColX, 157);

  // 4. Three Commercial Summary KPI Boxes
  const cardY = 180;
  const cardHeight = 52;
  const cardWidth = (contentWidth - 20) / 3;

  // Box 1: Total Estimate
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, cardY, cardWidth, cardHeight, 6, 6, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cardY, cardWidth, cardHeight, 6, 6, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL CONTRACT ESTIMATE", margin + 12, cardY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${totalEstimate.toLocaleString("en-IN")}`, margin + 12, cardY + 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("100% Total Project Scope", margin + 12, cardY + 47);

  // Box 2: Total Received
  const card2X = margin + cardWidth + 10;
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 6, 6, "F");
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 6, 6, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text("TOTAL RECEIVED AMOUNT", card2X + 12, cardY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text(`Rs. ${totalReceived.toLocaleString("en-IN")}`, card2X + 12, cardY + 36);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`${percentPaid}% Received (${paymentList.length} Installments)`, card2X + 12, cardY + 47);

  // Box 3: Pending Balance
  const card3X = margin + (cardWidth * 2) + 20;
  doc.setFillColor(255, 241, 242);
  doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 6, 6, "F");
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 6, 6, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(159, 18, 57);
  doc.text("PENDING BALANCE DUE", card3X + 12, cardY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(225, 29, 72);
  doc.text(`Rs. ${pendingBalance.toLocaleString("en-IN")}`, card3X + 12, cardY + 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(225, 29, 72);
  doc.text(totalEstimate > 0 ? `${100 - percentPaid}% Remaining Balance` : "No estimate set", card3X + 12, cardY + 47);

  // 5. Section Header for Transactions Table
  const tableTitleY = cardY + cardHeight + 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("PAYMENT TRANSACTION LEDGER & RECEIPT HISTORY", margin, tableTitleY);

  // 6. Build AutoTable Data
  const tableRows = paymentList.length > 0
    ? paymentList.map((pay, idx) => [
        String(idx + 1),
        pay.date || new Date().toLocaleDateString("en-IN"),
        `Rs. ${Number(pay.amount || 0).toLocaleString("en-IN")}`,
        pay.mode || "UPI / NEFT / RTGS",
        pay.note || "Client Payment Installment",
        `Rs. ${pendingBalance.toLocaleString("en-IN")}`,
        "SUCCESS"
      ])
    : [
        ["-", "-", "Rs. 0", "No Transactions", "No payments recorded to date", `Rs. ${totalEstimate.toLocaleString("en-IN")}`, "-"]
      ];

  // AutoTable
  autoTable(doc, {
    startY: tableTitleY + 8,
    margin: { left: margin, right: margin },
    head: [["#", "Payment Date", "Amount Received", "Payment Mode", "Note / Reference", "Pending Balance", "Status"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59], // Dark Slate
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      cellPadding: 6
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 5
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 25 },
      1: { halign: "center", cellWidth: 70 },
      2: { halign: "right", fontStyle: "bold", textColor: [5, 150, 105], cellWidth: 85 },
      3: { halign: "center", fontStyle: "bold", cellWidth: 85 },
      4: { halign: "left" },
      5: { halign: "right", fontStyle: "bold", textColor: [30, 41, 59], cellWidth: 80 },
      6: { halign: "center", fontStyle: "bold", textColor: [5, 150, 105], cellWidth: 50 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    foot: [
      [
        { content: "COMMERCIAL TOTALS", colSpan: 2, styles: { halign: "right", fontStyle: "bold", fillColor: [241, 245, 249] } },
        { content: `Rs. ${totalReceived.toLocaleString("en-IN")}`, styles: { halign: "right", fontStyle: "bold", textColor: [5, 150, 105], fillColor: [241, 245, 249] } },
        { content: `${paymentList.length} Total Records`, styles: { halign: "center", fontStyle: "bold", fillColor: [241, 245, 249] } },
        { content: "REMAINING BALANCE DUE:", styles: { halign: "right", fontStyle: "bold", fillColor: [241, 245, 249] } },
        { content: `Rs. ${pendingBalance.toLocaleString("en-IN")}`, styles: { halign: "right", fontStyle: "bold", textColor: [225, 29, 72], fillColor: [241, 245, 249] } },
        { content: "", styles: { fillColor: [241, 245, 249] } }
      ]
    ]
  });

  const finalY = (doc.lastAutoTable?.finalY || 450) + 25;

  // 7. Terms / Official Footer & Authorization Box
  if (finalY + 80 < pageHeight - 35) {
    // Payment Policy Note Box
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, finalY, contentWidth - 160, 60, 4, 4, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, finalY, contentWidth - 160, 60, 4, 4, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("PAYMENT TERMS & VERIFICATION:", margin + 10, finalY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("1. All payments recorded herein are officially credited to the client's project account.", margin + 10, finalY + 27);
    doc.text("2. Bank transfers and cheque clearances are subject to bank settlement confirmation.", margin + 10, finalY + 38);
    doc.text("3. For any invoice queries or discrepancies, please contact finance@velorainteriors.com.", margin + 10, finalY + 49);

    // Authorized Seal / Signatory Box
    const signX = margin + contentWidth - 145;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("FOR VELORA INTERIORS", signX, finalY + 14);

    doc.setDrawColor(203, 213, 225);
    doc.line(signX, finalY + 44, signX + 140, finalY + 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Authorized Signatory & Seal", signX, finalY + 55);
  }

  // 8. Footer on every page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Velora Luxury Interiors  |  www.velorainteriors.com  |  Support: +91 98765 43210", margin, pageHeight - 20);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 20, { align: "right" });
  }

  // Save PDF with sanitized client name
  const cleanClientName = clientName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${cleanClientName}_Payment_Statement.pdf`;
  doc.save(filename);
};
