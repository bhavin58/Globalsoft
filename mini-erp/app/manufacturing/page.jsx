"use client";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Manufacturing() {
  const [items, setItems] = useState([]);
  const [boms, setBoms] = useState([]);
  const [bomForm, setBomForm] = useState({ parent_item_id: "", component_item_id: "", qty_per: 1 });
  const [moForm, setMoForm] = useState({ product_item_id: "", qty: 1 });

  async function load() {
    const { data: its } = await supabase.from("items").select("id, sku, name").order("sku");
    setItems(its || []);
    const { data: b } = await supabase.from("bom").select("*");
    setBoms(b || []);
  }
  useEffect(()=>{ load(); }, []);

  async function addBom(e) {
    e.preventDefault();
    if (!bomForm.parent_item_id || !bomForm.component_item_id) return;
    await supabase.from("bom").insert([{
      parent_item_id: bomForm.parent_item_id,
      component_item_id: bomForm.component_item_id,
      qty_per: Number(bomForm.qty_per)
    }]);
    setBomForm({ parent_item_id: "", component_item_id: "", qty_per: 1 });
    load();
  }

  async function makeMO(e) {
    e.preventDefault();
    const qty = Number(moForm.qty);
    if (!moForm.product_item_id || qty <= 0) return;

    // Create MO
    const { data: moData, error: moErr } = await supabase
      .from("manufacturing_orders")
      .insert([{ product_item_id: moForm.product_item_id, qty, status: "done" }])
      .select().single();
    if (moErr) { alert(moErr.message); return; }

    // Find BOM lines
    const { data: bomLines } = await supabase
      .from("bom")
      .select("*")
      .eq("parent_item_id", moForm.product_item_id);

    // Consume components
    for (const line of bomLines || []) {
      const consumeQty = -Math.abs(Number(line.qty_per) * qty);
      await supabase.from("stock_transactions").insert([{
        item_id: line.component_item_id, qty: consumeQty, reason: "mo_consumption", ref: moData.id
      }]);
    }
    // Produce finished goods
    await supabase.from("stock_transactions").insert([{
      item_id: moForm.product_item_id, qty: qty, reason: "mo_production", ref: moData.id
    }]);

    setMoForm({ product_item_id: "", qty: 1 });
    alert("Manufacturing complete.");
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-2">Manufacturing</h1>
      <Nav />

      <section className="bg-white border rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-2">Bill of Materials</h2>
        <form onSubmit={addBom} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select required className="border rounded-md px-3 py-2"
            value={bomForm.parent_item_id} onChange={e=>setBomForm({...bomForm, parent_item_id:e.target.value})}>
            <option value="">Parent (Product)</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
          </select>
          <select required className="border rounded-md px-3 py-2"
            value={bomForm.component_item_id} onChange={e=>setBomForm({...bomForm, component_item_id:e.target.value})}>
            <option value="">Component</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
          </select>
          <input type="number" min="0.0001" step="0.0001" className="border rounded-md px-3 py-2"
            value={bomForm.qty_per} onChange={e=>setBomForm({...bomForm, qty_per:e.target.value})}/>
          <div />
          <button className="bg-black text-white rounded-md px-4 py-2">Add BOM Line</button>
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Component</th>
                <th className="text-right p-2">Qty /</th>
              </tr>
            </thead>
            <tbody>
              {(boms||[]).map((b, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{items.find(i=>i.id===b.parent_item_id)?.sku}</td>
                  <td className="p-2">{items.find(i=>i.id===b.component_item_id)?.sku}</td>
                  <td className="p-2 text-right">{Number(b.qty_per)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-2">Manufacture Product</h2>
        <form onSubmit={makeMO} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select required className="border rounded-md px-3 py-2"
            value={moForm.product_item_id} onChange={e=>setMoForm({...moForm, product_item_id:e.target.value})}>
            <option value="">Product</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
          </select>
          <input type="number" min="1" className="border rounded-md px-3 py-2"
            value={moForm.qty} onChange={e=>setMoForm({...moForm, qty:e.target.value})}/>
          <div />
          <button className="bg-black text-white rounded-md px-4 py-2">Produce</button>
        </form>
        <p className="text-sm text-gray-600 mt-2">Consumes BOM components and adds finished goods to stock.</p>
      </section>
    </main>
  );
}
