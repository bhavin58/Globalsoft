"use client";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Procurement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item_id: "", qty: 1 });

  async function load() {
    const { data } = await supabase.from("items").select("id, sku, name").order("sku");
    setItems(data || []);
  }
  useEffect(()=>{ load(); }, []);

  async function receive(e) {
    e.preventDefault();
    const qty = Number(form.qty);
    if (!form.item_id || qty <= 0) return;
    await supabase.from("stock_transactions").insert([{
      item_id: form.item_id, qty: Math.abs(qty), reason: "purchase_receipt", ref: "PO"
    }]);
    await supabase.from("procurements").insert([{ item_id: form.item_id, qty }]);
    setForm({ item_id: "", qty: 1 });
    alert("Receipt recorded.");
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-2">Procurement</h1>
      <Nav />
      <form onSubmit={receive} className="bg-white border rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select required className="border rounded-md px-3 py-2" value={form.item_id} onChange={e=>setForm({...form, item_id:e.target.value})}>
          <option value="">Choose Item…</option>
          {items.map(i=> <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
        </select>
        <input type="number" min="1" className="border rounded-md px-3 py-2" value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})}/>
        <div />
        <button className="bg-black text-white rounded-md px-4 py-2">Record Receipt</button>
      </form>
      <p className="text-sm text-gray-600">This creates a positive stock transaction and logs it in <code>procurements</code>.</p>
    </main>
  );
}
