export const metadata = {
  title: "Mini ERP",
  description: "Free, public ERP MVP"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-7xl mx-auto p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
