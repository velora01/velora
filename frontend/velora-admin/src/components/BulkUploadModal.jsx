import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Download, X, Trash2, ArrowRight } from "lucide-react";
import erpApi from "../services/erpService";

export default function BulkUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Generate and download a comprehensive CSV template
  const handleDownloadSample = () => {
    const headers = [
      "Salutation",
      "Name",
      "Phone",
      "Email",
      "Enquiry Date",
      "Address",
      "Occupation",
      "Landline STD",
      "Landline Number",
      "Company Name",
      "Alt Salutation",
      "Alt Name",
      "Alt Phone",
      "Alt Email",
      "Project Type",
      "Project Subtype",
      "Site Status",
      "Site Size",
      "Site Location",
      "Site Address",
      "GST Number",
      "Source",
      "Handled By",
      "Designed By",
      "Prospect Status",
      "Budget",
      "Timeline",
      "Expected On",
      "Financial Status",
      "Priority Status",
      "Remarks",
      "Office Visited",
      "Site Visited",
      "Reference Site Visited"
    ];

    const sampleRow1 = [
      "Mr",
      "PREM SHUKLA",
      "7800020496",
      "prem.shukla@example.com",
      "2026-08-13",
      "Flat 402, Marvel Piazza",
      "Business Executive",
      "020",
      "25678901",
      "Shukla Enterprises",
      "Mrs",
      "Anita Shukla",
      "9823456789",
      "anita.shukla@example.com",
      "Commercial",
      "Office Space",
      "Ready to Move",
      "2400 sq.ft",
      "PHASE 2",
      "Plot 14, Hinjewadi Phase 2",
      "27AAACG0000A1Z5",
      "Website",
      "Admin",
      "Architect Rohit",
      "Hot",
      "₹45 Lakhs",
      "2 Months",
      "2026-10-15",
      "Self Funded",
      "High",
      "Requires full ergonomic modular workstations",
      "Yes",
      "No",
      "No"
    ];

    const sampleRow2 = [
      "Mr",
      "Rajeev Singhal",
      "8948274553",
      "rajeev.s@example.com",
      "2026-08-08",
      "Rishita Serenity Pocket C",
      "IT Consultant",
      "020",
      "",
      "",
      "Mrs",
      "Pooja Singhal",
      "9811223344",
      "",
      "Renovation",
      "3BHK Luxury Flat",
      "Possession Handed Over",
      "1850 sq.ft",
      "Sushant Golf City",
      "Rishita Serenity Pocket C, Sector 6",
      "",
      "Instagram",
      "Admin",
      "Designer Priya",
      "Warm",
      "₹30 Lakhs",
      "3 Months",
      "2026-11-01",
      "Bank Loan Approved",
      "Medium",
      "Living room and modular kitchen redesign",
      "No",
      "Yes",
      "No"
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), sampleRow1.map((f) => `"${f}"`).join(","), sampleRow2.map((f) => `"${f}"`).join(",")].join(
        "\n"
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Velora_Enquiry_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust CSV Line Parser that handles quotes and commas
  const parseCSVLine = (text) => {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (fileObj) => {
    if (!fileObj.name.toLowerCase().endsWith(".csv")) {
      setErrorMsg("Please upload a valid .csv file.");
      return;
    }

    setFile(fileObj);
    setErrorMsg("");
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text
          .split(/\r\n|\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          setErrorMsg("CSV file must contain a header row and at least one data row.");
          setParsedData([]);
          return;
        }

        const rawHeaders = parseCSVLine(lines[0]).map((h) =>
          h.toLowerCase().replace(/[^a-z0-9]/g, "")
        );

        // Header mapping dictionary
        const headerMap = {
          salutation: "salutation",
          name: "name",
          clientname: "name",
          phone: "phone",
          phonenumber: "phone",
          mobile: "phone",
          clientphone: "phone",
          email: "email",
          clientemail: "email",
          enquirydate: "enquiryDate",
          date: "enquiryDate",
          address: "address",
          occupation: "occupation",
          landlinestd: "landlineSTD",
          landlinenumber: "landlineNumber",
          companyname: "companyName",
          company: "companyName",
          altsalutation: "altSalutation",
          altname: "altName",
          altphone: "altPhone",
          altemail: "altEmail",
          projecttype: "projectType",
          projectsubtype: "projectSubtype",
          sitestatus: "siteStatus",
          sitesize: "siteSize",
          sitelocation: "siteLocation",
          location: "siteLocation",
          siteaddress: "siteAddress",
          gstnumber: "gstNumber",
          gst: "gstNumber",
          source: "source",
          handledby: "handledBy",
          designedby: "designedBy",
          prospectstatus: "prospectStatus",
          budget: "budget",
          timeline: "timeline",
          expectedon: "expectedOn",
          financialstatus: "financialStatus",
          prioritystatus: "priorityStatus",
          priority: "priorityStatus",
          remarks: "remarks",
          notes: "remarks",
          officevisited: "officeVisited",
          sitevisited: "siteVisited",
          referencesitevisited: "referenceSiteVisited"
        };

        const records = [];

        for (let i = 1; i < lines.length; i++) {
          const rowValues = parseCSVLine(lines[i]);
          if (rowValues.length === 0 || rowValues.every((v) => !v)) continue;

          const leadObj = {
            salutation: "Mr",
            name: "",
            phone: "",
            email: "",
            enquiryDate: new Date().toISOString().split("T")[0],
            address: "",
            occupation: "",
            landlineSTD: "",
            landlineNumber: "",
            companyName: "",
            altSalutation: "Mr",
            altName: "",
            altPhone: "",
            altEmail: "",
            projectType: "Residential",
            projectSubtype: "",
            siteStatus: "Possession Handed Over",
            siteSize: "",
            siteLocation: "",
            siteAddress: "",
            gstNumber: "",
            source: "Website",
            handledBy: "Admin",
            designedBy: "",
            prospectStatus: "Warm",
            budget: "",
            timeline: "",
            expectedOn: "",
            financialStatus: "Self Funded",
            priorityStatus: "Medium",
            remarks: "",
            officeVisited: false,
            siteVisited: false,
            referenceSiteVisited: false,
            status: "Inquiry"
          };

          rawHeaders.forEach((rawH, idx) => {
            const mappedKey = headerMap[rawH];
            if (mappedKey && rowValues[idx] !== undefined) {
              const val = rowValues[idx];
              if (
                mappedKey === "officeVisited" ||
                mappedKey === "siteVisited" ||
                mappedKey === "referenceSiteVisited"
              ) {
                leadObj[mappedKey] =
                  val.toLowerCase() === "yes" ||
                  val.toLowerCase() === "true" ||
                  val === "1";
              } else {
                leadObj[mappedKey] = val;
              }
            }
          });

          records.push(leadObj);
        }

        setParsedData(records);
      } catch {
        setErrorMsg("Failed to parse CSV file. Please check format.");
        setParsedData([]);
      }
    };
    reader.readAsText(fileObj);
  };

  const handleUpload = async () => {
    if (!parsedData || parsedData.length === 0) {
      setErrorMsg("No records available to upload.");
      return;
    }

    const validRecords = parsedData.filter((r) => r.name && r.phone);
    if (validRecords.length === 0) {
      setErrorMsg("No valid records found with both Name and Phone.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      const res = await erpApi.bulkUploadLeads(validRecords);
      setUploadResult(res?.data || { insertedCount: validRecords.length });
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to bulk upload enquiries");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setErrorMsg("");
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validCount = parsedData.filter((r) => r.name && r.phone).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EAE3D2] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#9E7B1D] flex items-center justify-center font-bold">
              <UploadCloud size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Bulk Upload Enquiries</h2>
              <p className="text-xs text-[#9E7B1D] font-medium">Import multiple enquiries instantly via CSV file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-amber-50 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Action Row: Template Download & Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-[#9E7B1D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-stone-900">Standard CSV Template</p>
                <p className="text-[11px] text-stone-600">
                  Ensure your file has required columns (<b>Name</b> and <b>Phone</b>). Use our formatted template for best results.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#9E7B1D] bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition shrink-0 shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* Upload Drop Area */}
          {!file && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-[#D4AF37] rounded-2xl p-8 text-center cursor-pointer transition bg-[#FAF9F5] hover:bg-amber-50/40 flex flex-col items-center justify-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-full bg-amber-50 text-[#9E7B1D] flex items-center justify-center mb-3 group-hover:scale-110 transition border border-amber-200">
                <UploadCloud size={28} />
              </div>
              <p className="text-sm font-bold text-stone-800 mb-1">
                Click to browse or drag and drop your CSV file here
              </p>
              <p className="text-xs text-stone-400">Supported format: .CSV (Max 10MB)</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Upload Result Banner */}
          {uploadResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle size={18} className="text-emerald-600" />
                <span>Upload Complete!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Successfully imported <b>{uploadResult.insertedCount || validCount}</b> enquiries into the CRM system.
                {uploadResult.duplicateCount > 0 && ` (${uploadResult.duplicateCount} marked as duplicate phone numbers)`}
              </p>
            </div>
          )}

          {/* Preview Table */}
          {file && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-800">
                    File: <span className="text-[#9E7B1D] font-extrabold">{file.name}</span>
                  </span>
                  <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                    {parsedData.length} records parsed
                  </span>
                  {validCount > 0 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      {validCount} ready
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">
                      {invalidCount} missing name/phone
                    </span>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear & Pick Another</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="border border-[#EAE3D2] rounded-xl overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#FAF9F5] border-b border-[#EAE3D2] text-stone-700 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Name *</th>
                      <th className="py-2.5 px-3">Phone *</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Project Type</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Handled By</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0] text-stone-700">
                    {parsedData.map((row, idx) => {
                      const isValid = Boolean(row.name && row.phone);
                      return (
                        <tr key={idx} className={isValid ? "hover:bg-amber-50/30" : "bg-rose-50/50"}>
                          <td className="py-2 px-3 font-mono text-stone-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-stone-900">
                            {row.name ? (
                              row.name
                            ) : (
                              <span className="text-rose-500 italic">Missing Name</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {row.phone ? (
                              row.phone
                            ) : (
                              <span className="text-rose-500 italic">Missing Phone</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-stone-500">{row.email || "-"}</td>
                          <td className="py-2 px-3">{row.projectType || "Residential"}</td>
                          <td className="py-2 px-3">{row.siteLocation || "-"}</td>
                          <td className="py-2 px-3">{row.handledBy || "Admin"}</td>
                          <td className="py-2 px-3">
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                                <CheckCircle size={10} /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-medium border border-rose-200">
                                <AlertCircle size={10} /> Invalid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-[#EAE3D2] rounded-xl hover:bg-stone-50 transition cursor-pointer"
          >
            {uploadResult ? "Close" : "Cancel"}
          </button>

          {file && !uploadResult && (
            <button
              onClick={handleUpload}
              disabled={isProcessing || validCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition cursor-pointer"
            >
              {isProcessing ? (
                <span>Importing records...</span>
              ) : (
                <>
                  <span>Import {validCount} Enquiries</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}

          {uploadResult && (
            <button
              onClick={() => {
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}