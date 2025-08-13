"use client";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [adjust, setAdjust] = useState({ item_id: "", qty: 0, note: "" });

  async function load() {
    const { data, error } = await supabase.from("v_item_onhand").select("*").order("sku");
    if (!error) setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  async function submitAdjust(e) {
    e.preventDefault();
    const qty = Number(adjust.qty);
    if (!adjust.item_id || !qty) return;
    await supabase.from("stock_transactions").insert([{
      item_id: adjust.item_id, qty, reason: "adjustment", ref: "ADJ", note: adjust.note || null
    }]);
    setAdjust({ item_id: "", qty: 0, note: "" });
    load();
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-2">Inventory</h1>
      <Nav />

      <form onSubmit={submitAdjust} className="bg-white border rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select required className="border rounded-md px-3 py-2" value={adjust.item_id} onChange={e=>setAdjust({...adjust, item_id:e.target.value})}>
          <option value="">Choose Item…</option>
          {rows.map(r => <option key={r.item_id} value={r.item_id}>{r.sku} — {r.name}</option>)}
        </select>
        <input type="number" placeholder="Qty (+/-)" className="border rounded-md px-3 py-2" value={adjust.qty} onChange={e=>setAdjust({...adjust, qty:e.target.value})}/>
        <input placeholder="Note (optional)" className="border rounded-md px-3 py-2" value={adjust.note} onChange={e=>setAdjust({...adjust, note:e.target.value})}/>
        <button className="bg-black text-white rounded-md px-4 py-2">Post Adjustment</button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Name</th>
              <th className="text-right p-2">On Hand</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.item_id} className="border-t">
                <td className="p-2">{r.sku}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2 text-right">{Number(r.on_hand)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
