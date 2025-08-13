import Link from 'next/link';

export default function Navbar(){
  const links=[
    {href:'/',label:'Home'},
    {href:'/items',label:'Items'},
    {href:'/inventory',label:'Inventory'},
    {href:'/sales',label:'Sales'},
    {href:'/procurement',label:'Procurement'},
    {href:'/manufacturing',label:'Manufacturing'}
  ];
  return (
    <header className="border-b">
      <nav className="max-w-5xl mx-auto flex flex-wrap gap-4 p-4">
        {links.map(l=>(
          <Link key={l.href} href={l.href} className="text-sm px-3 py-1 rounded hover:bg-gray-100">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
