import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { CartItem, Product } from "../../types";

interface CartPageProps {
  customerId: string;
  onBack: () => void;
  onCheckout: () => void;
}

export default function CartPage({
  customerId,
  onBack,
  onCheckout,
}: CartPageProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    getLS<CartItem[]>(`apniDukan_cart_${customerId}`, []),
  );
  const products = getLS<Product[]>("apniDukan_products", []);

  function updateQty(productId: string, delta: number) {
    const updated = cartItems
      .map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(0, i.quantity + delta) }
          : i,
      )
      .filter((i) => i.quantity > 0);
    setCartItems(updated);
    setLS(`apniDukan_cart_${customerId}`, updated);
  }

  function removeItem(productId: string) {
    const updated = cartItems.filter((i) => i.productId !== productId);
    setCartItems(updated);
    setLS(`apniDukan_cart_${customerId}`, updated);
  }

  const enrichedItems = cartItems
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((item) => item.product);

  const total = enrichedItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0,
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[480px] mx-auto">
      <header className="sticky top-0 z-10 bg-white shadow-sm flex items-center px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-primary font-medium mr-4"
        >
          ← Back
        </button>
        <h1 className="font-bold text-gray-900">Cart</h1>
        {cartItems.length > 0 && (
          <Badge className="ml-auto">
            {cartItems.reduce((s, i) => s + i.quantity, 0)} items
          </Badge>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        {enrichedItems.length === 0 ? (
          <div data-ocid="cart.empty_state" className="text-center py-20">
            <p className="text-gray-400 text-sm">Your cart is empty</p>
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="mt-4"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {enrichedItems.map((item, idx) => (
              <div
                key={item.productId}
                data-ocid={`cart.item.${idx + 1}`}
                className="bg-white rounded-xl shadow-sm p-3 flex gap-3 border border-gray-100"
              >
                {item.product?.photos[0] ? (
                  <img
                    src={item.product.photos[0]}
                    alt={item.product?.name}
                    className="w-16 h-16 object-contain rounded bg-gray-50"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {item.product?.name}
                  </p>
                  <p className="text-sm font-extrabold text-primary">
                    ₹{item.product?.price.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      data-ocid={`cart.secondary_button.${idx + 1}`}
                      onClick={() => updateQty(item.productId, -1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      data-ocid={`cart.primary_button.${idx + 1}`}
                      onClick={() => updateQty(item.productId, 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center bg-primary text-primary-foreground"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid={`cart.delete_button.${idx + 1}`}
                  onClick={() => removeItem(item.productId)}
                  className="self-start"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {enrichedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-700">Total</span>
            <span className="text-xl font-extrabold text-primary">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
          <Button
            type="button"
            data-ocid="cart.submit_button"
            onClick={onCheckout}
            className="w-full h-12 font-bold text-base"
          >
            Proceed to Order
          </Button>
        </div>
      )}
    </div>
  );
}
