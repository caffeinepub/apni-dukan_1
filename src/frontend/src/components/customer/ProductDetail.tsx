import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { CartItem, Product } from "../../types";

interface ProductDetailProps {
  product: Product;
  customerId: string;
  onBack: () => void;
  onCart: () => void;
}

export default function ProductDetail({
  product,
  customerId,
  onBack,
  onCart,
}: ProductDetailProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  function addToCart() {
    const cart = getLS<CartItem[]>(`apniDukan_cart_${customerId}`, []);
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setLS(
        `apniDukan_cart_${customerId}`,
        cart.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setLS(`apniDukan_cart_${customerId}`, [
        ...cart,
        { productId: product.id, quantity: 1 },
      ]);
    }
    toast.success("Added to cart!");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[480px] mx-auto">
      <header className="sticky top-0 z-10 bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-primary font-medium"
        >
          ← Back
        </button>
        <button
          type="button"
          data-ocid="product_detail.cart.button"
          onClick={onCart}
        >
          <ShoppingCart className="w-6 h-6 text-gray-700" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Photo Gallery */}
        <div className="bg-white">
          {product.photos.length > 0 ? (
            <>
              <img
                src={product.photos[photoIndex]}
                alt={product.name}
                className="w-full h-64 object-contain bg-gray-50"
              />
              {product.photos.length > 1 && (
                <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
                  {product.photos.map((photo, i) => (
                    <button
                      key={photo.slice(-20)}
                      type="button"
                      data-ocid={`product_detail.toggle.${i + 1}`}
                      onClick={() => setPhotoIndex(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded border-2 overflow-hidden ${
                        i === photoIndex ? "border-primary" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`view ${i + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>

        <div className="px-4 py-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <Badge
              variant={
                product.availability === "available" ? "default" : "destructive"
              }
              className="flex-shrink-0 text-xs"
            >
              {product.availability === "available"
                ? "In Stock"
                : "Out of Stock"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-extrabold text-primary">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.cutPrice > 0 && (
              <span className="text-base text-gray-400 line-through">
                ₹{product.cutPrice.toLocaleString("en-IN")}
              </span>
            )}
            {product.discount > 0 && (
              <span className="text-sm font-bold text-green-600">
                {product.discount}% off
              </span>
            )}
          </div>

          {product.features && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-700 mb-2">
                Product Details
              </h2>
              <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white rounded-xl p-3 border">
                {product.features}
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t p-4">
        {product.availability === "available" ? (
          <Button
            type="button"
            data-ocid="product_detail.primary_button"
            onClick={addToCart}
            className="w-full h-12 font-bold text-base"
          >
            Add to Cart
          </Button>
        ) : (
          <Button
            type="button"
            data-ocid="product_detail.secondary_button"
            variant="outline"
            className="w-full h-12 font-bold text-base"
            disabled
          >
            Notify Me
          </Button>
        )}
      </div>
    </div>
  );
}
