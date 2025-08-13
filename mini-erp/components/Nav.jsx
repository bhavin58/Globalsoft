"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/items", label: "Items" },
  { href: "/inventory", label: "Inventory" },
  { href: "/sales", label: "Sales" },
  { href: "/procurement", label: "Procurement" },
  { href: "/manufacturing", label: "Manufacturing" }
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 mb-6">
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={`px-3 py-2 rounded-md border text-sm hover:bg-white ${pathname===l.href ? "bg-white border-gray-800" : "bg-gray-100 border-gray-200"}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
