"use client";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Items() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ sku: "", name: "", unit: "ea", description: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data, error } = await supabase.from("items").select("*").order("sku");
    if (!error) setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  async function addItem(e) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("items").insert([form]);
    setForm({ sku: "", name: "", unit: "ea", description: "" });
    setSaving(false);
    load();
  }

  async function del(id) {
    await supabase.from("items").delete().eq("id", id);
    load();
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-2">Items</h1>
      <Nav />

      <form onSubmit={addItem} className="bg-white border rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input required placeholder="SKU" className="border rounded-md px-3 py-2"
               value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})}/>
        <input required placeholder="Name" className="border rounded-md px-3 py-2"
               value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Unit (ea, kg...)" className="border rounded-md px-3 py-2"
               value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})}/>
        <input placeholder="Description" className="border rounded-md px-3 py-2 md:col-span-1"
               value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <button disabled={saving} className="bg-black text-white rounded-md px-4 py-2">Add Item</button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Unit</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.sku}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.unit}</td>
                <td className="p-2">
                  <button onClick={()=>del(r.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
