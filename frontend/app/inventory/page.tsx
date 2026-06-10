"use client";
import { useEffect, useState } from "react";
import { getProducts, sellProduct, updateStock } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  category: string;
  weight_kg: number | null;
  stock: number;
  price_type: string;
  price: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const handleSell = async (id: number) => {
    const qty = prompt("How many units to sell?");
    if (!qty) return;
    const data = await sellProduct(id, parseInt(qty));
    alert(data.message || data.detail);
    const updated = await getProducts();
    setProducts(updated);
  };

  const handleUpdateStock = async (id: number) => {
    const qty = prompt("Enter new stock quantity:");
    if (!qty) return;
    const data = await updateStock(id, parseInt(qty));
    alert(data.message || data.detail);
    const updated = await getProducts();
    setProducts(updated);
  };

  if (loading) return <p className="text-white p-8">Loading inventory...</p>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold text-[#D4AF37] mb-8">Inventory</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-600 text-slate-400 text-sm uppercase">
              <th className="py-3 pr-6">Product</th>
              <th className="py-3 pr-6">Category</th>
              <th className="py-3 pr-6">Price Type</th>
              <th className="py-3 pr-6">Price</th>
              <th className="py-3 pr-6">Stock</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-4 pr-6 font-medium">{product.name}</td>
                <td className="py-4 pr-6 text-slate-400">{product.category}</td>
                <td className="py-4 pr-6 text-slate-400">{product.price_type}</td>
                <td className="py-4 pr-6 text-[#D4AF37]">₹{product.price}</td>
                <td className="py-4 pr-6">
                  <span className={`px-3 py-1 rounded-full text-sm ${product.stock < 20 ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="py-4 flex gap-3">
                  <button
                    onClick={() => handleSell(product.id)}
                    className="bg-[#D4AF37] text-black px-4 py-1 rounded-lg text-sm font-semibold hover:opacity-80"
                  >
                    Sell
                  </button>
                  <button
                    onClick={() => handleUpdateStock(product.id)}
                    className="bg-slate-700 text-white px-4 py-1 rounded-lg text-sm hover:bg-slate-600"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}