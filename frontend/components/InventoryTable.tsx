export default function InventoryTable() {
  const products = [
    {
      name: "Brass Rod 10mm",
      category: "Rods",
      stock: "450 kg",
      status: "In Stock",
    },
    {
      name: "Brass Sheet 2mm",
      category: "Sheets",
      stock: "320 kg",
      status: "In Stock",
    },
    {
      name: "Brass Tube 15mm",
      category: "Tubes",
      stock: "280 kg",
      status: "In Stock",
    },
    {
      name: "Brass Wire 5mm",
      category: "Wire",
      stock: "45 kg",
      status: "Low Stock",
    },
    {
      name: "Brass Scrap Grade A",
      category: "Scrap",
      stock: "150 kg",
      status: "In Stock",
    },
  ];

  return (
    <div className="bg-[#1B2940] rounded-3xl mt-8 overflow-hidden">
      <div className="p-8 border-b border-slate-700">
        <h2 className="text-white text-3xl font-bold">
          Inventory Overview
        </h2>
      </div>

      <table className="w-full table-fixed text-white">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400">
            <th className="text-left p-6 w-[30%]">Product Name</th>
            <th className="text-left p-6">Category</th>
            <th className="text-left p-6">Stock Quantity</th>
            <th className="text-left p-6">Status</th>
            <th className="text-left p-6">Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product, index) => (
            <tr
              key={index}
              className="border-b border-slate-800"
            >
              <td className="p-6">{product.name}</td>
              <td className="p-6">{product.category}</td>
              <td className="p-6 font-semibold">
                {product.stock}
              </td>

              <td className="p-6">
                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    product.status === "In Stock"
                      ? "bg-green-900 text-green-400"
                      : "bg-yellow-900 text-yellow-400"
                  }`}
                >
                  {product.status}
                </span>
              </td>

              <td className="p-6">
                <button className="bg-[#D4AF37] text-black px-5 py-2 rounded-xl font-medium">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}