import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";

export default function InventoryMaterials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");

  const loadMaterials = () => {
    erpApi.getMaterials({ search }).then((res) => {
      if (res?.data) setMaterials(res.data);
    });
  };

  useEffect(() => {
    loadMaterials();
  }, [search]);

  const columns = [
    { header: "Item Code", key: "itemCode", sortable: true },
    { header: "Material Name", key: "name", sortable: true },
    { header: "Category", key: "category" },
    { header: "Brand", key: "brand" },
    {
      header: "Unit Price (₹)",
      render: (row) => `₹${(row.unitPrice || 0).toLocaleString("en-IN")}`
    },
    { header: "Stock Quantity", key: "stockQty" },
    { header: "Supplier / Vendor", key: "vendorName" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Showroom Materials & Inventory</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Manage luxury hardware, veneers, laminates, and supplier catalogs</p>
      </div>

      <DataTable title="Raw Materials & Stock Catalog" columns={columns} data={materials} search={search} setSearch={setSearch} />
    </div>
  );
}
