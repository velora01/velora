import React, { useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";

export default function BOQBuilder({ onSaveBOQ }) {
  const [clientName, setClientName] = useState("");
  const [preparedBy, setPreparedBy] = useState("Velora Senior Architect");
  const [rooms, setRooms] = useState([
    {
      name: "Living Room",
      items: [
        { itemName: "TV Console Unit (Italian Marble + Veneer)", material: "Bespoke Italian Marble", quantity: 1, unit: "unit", price: 185000, discountPercent: 5, gstPercent: 18 }
      ]
    },
    {
      name: "Master Bedroom",
      items: [
        { itemName: "Walk-in Wardrobe (Floor-to-Ceiling Fluted Glass)", material: "Commercial Plywood + Fluted Glass", quantity: 120, unit: "sq.ft", price: 1850, discountPercent: 0, gstPercent: 18 }
      ]
    }
  ]);

  const addRoom = () => {
    setRooms([...rooms, { name: `New Room ${rooms.length + 1}`, items: [] }]);
  };

  const removeRoom = (rIdx) => {
    setRooms(rooms.filter((_, idx) => idx !== rIdx));
  };

  const addItemToRoom = (rIdx) => {
    const updated = [...rooms];
    updated[rIdx].items.push({
      itemName: "Custom Joinery",
      material: "Premium HDMR",
      quantity: 1,
      unit: "unit",
      price: 25000,
      discountPercent: 0,
      gstPercent: 18
    });
    setRooms(updated);
  };

  const updateItem = (rIdx, iIdx, field, val) => {
    const updated = [...rooms];
    updated[rIdx].items[iIdx][field] = val;
    setRooms(updated);
  };

  const removeItem = (rIdx, iIdx) => {
    const updated = [...rooms];
    updated[rIdx].items.splice(iIdx, 1);
    setRooms(updated);
  };

  // Computations
  let subtotal = 0;
  let gstTotal = 0;

  rooms.forEach((room) => {
    room.items.forEach((item) => {
      const lineSub = (item.quantity || 0) * (item.price || 0);
      const discount = lineSub * ((item.discountPercent || 0) / 100);
      const netLine = lineSub - discount;
      const gst = netLine * ((item.gstPercent || 18) / 100);
      subtotal += netLine;
      gstTotal += gst;
    });
  });

  const grandTotal = subtotal + gstTotal;

  const handleSave = () => {
    if (!clientName) return alert("Please specify client name");
    onSaveBOQ({
      clientName,
      preparedBy,
      rooms,
      subtotal,
      gstTotal,
      grandTotal
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator size={20} className="text-[#9E7B1D]" />
            Dynamic Room-Wise BOQ Builder
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure luxury room specifications with live GST computation</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addRoom}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#C5A059] transition"
          >
            <Plus size={14} className="text-[#9E7B1D]" />
            <span>Add Room</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] rounded-xl hover:opacity-95 shadow-sm"
          >
            <span>Save & Generate BOQ</span>
          </button>
        </div>
      </div>

      {/* General Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client Name</label>
          <input
            type="text"
            placeholder="e.g. Mr. Rajesh Sharma"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#C5A059]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prepared By</label>
          <input
            type="text"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* Rooms List */}
      <div className="space-y-6">
        {rooms.map((room, rIdx) => (
          <div key={rIdx} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <input
                type="text"
                value={room.name}
                onChange={(e) => {
                  const updated = [...rooms];
                  updated[rIdx].name = e.target.value;
                  setRooms(updated);
                }}
                className="bg-transparent font-bold text-sm text-[#9E7B1D] focus:outline-none border-b border-slate-300"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addItemToRoom(rIdx)}
                  className="text-xs text-slate-700 hover:text-[#9E7B1D] font-bold"
                >
                  + Add Line Item
                </button>
                <button onClick={() => removeRoom(rIdx)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Room items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-1">Item</th>
                    <th className="py-2 px-1">Material</th>
                    <th className="py-2 px-1 w-16">Qty</th>
                    <th className="py-2 px-1 w-16">Unit</th>
                    <th className="py-2 px-1 w-24">Price (₹)</th>
                    <th className="py-2 px-1 w-20">GST %</th>
                    <th className="py-2 px-1 w-24">Total</th>
                    <th className="py-2 px-1 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {room.items.map((item, iIdx) => {
                    const lineVal = (item.quantity || 0) * (item.price || 0);
                    const lineGst = lineVal * ((item.gstPercent || 18) / 100);
                    const lineTotal = lineVal + lineGst;

                    return (
                      <tr key={iIdx}>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => updateItem(rIdx, iIdx, "itemName", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            value={item.material}
                            onChange={(e) => updateItem(rIdx, iIdx, "material", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(rIdx, iIdx, "quantity", Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateItem(rIdx, iIdx, "unit", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(rIdx, iIdx, "price", Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <input
                            type="number"
                            value={item.gstPercent}
                            onChange={(e) => updateItem(rIdx, iIdx, "gstPercent", Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </td>
                        <td className="py-1.5 px-1 font-bold text-[#9E7B1D]">
                          ₹{Math.round(lineTotal).toLocaleString("en-IN")}
                        </td>
                        <td className="py-1.5 px-1">
                          <button onClick={() => removeItem(rIdx, iIdx)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Grand Totals Summary Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="text-slate-500 font-medium">
          Total Items: <span className="text-slate-900 font-bold">{rooms.reduce((a, r) => a + r.items.length, 0)}</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-500 block">Subtotal:</span>
            <span className="font-bold text-slate-900 text-sm">₹{Math.round(subtotal).toLocaleString("en-IN")}</span>
          </div>
          <div>
            <span className="text-slate-500 block">GST (18%):</span>
            <span className="font-bold text-[#9E7B1D] text-sm">₹{Math.round(gstTotal).toLocaleString("en-IN")}</span>
          </div>
          <div className="pl-4 border-l border-slate-200">
            <span className="text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Grand Total:</span>
            <span className="font-black text-[#9E7B1D] text-lg">₹{Math.round(grandTotal).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
