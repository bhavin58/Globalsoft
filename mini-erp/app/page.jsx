"use client";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {
  const [stats, setStats] = useState({ items: 0, onhandTotal: 0 });

  useEffect(() => {
    async function load() {
      const { data: items } = await supabase.from("items").select("id");
      const { data: onhand } = await supabase.from("v_item_onhand").select("on_hand");
      const total = (onhand || []).reduce((s, r) => s + Number(r.on_hand || 0), 0);
      setStats({ items: items?.length || 0, onhandTotal: total });
    }
    load();
  }, []);

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-2">Mini ERP</h1>
      <p className="text-gray-600 mb-4">Free, public MVP — no login required</p>
      <Nav />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border">
          <div className="text-sm text-gray-500">Items</div>
          <div className="text-3xl font-bold">{stats.items}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border">
          <div className="text-sm text-gray-500">Total On Hand</div>
          <div className="text-3xl font-bold">{stats.onhandTotal}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border">
          <div className="text-sm text-gray-500">Status</div>
          <div className="text-lg">Public / Read-Write</div>
        </div>
      </div>
    </main>
  );
}
