import './globals.css';
import Navbar from '../components/Navbar.jsx';
export const metadata={title:'Globalsoft ERP',description:'Basic ERP with Items, Inventory, Sales, Procurement, Manufacturing'};
export default function RootLayout({ children }){return(<html lang='en'><body><Navbar/><main className='max-w-5xl mx-auto p-6'>{children}</main></body></html>);}
