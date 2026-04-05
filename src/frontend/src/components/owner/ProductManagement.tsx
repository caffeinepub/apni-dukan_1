import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { Category, Product } from "../../types";

interface ProductManagementProps {
  onBack: () => void;
}

export default function ProductManagement({
  onBack: _onBack,
}: ProductManagementProps) {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(() =>
    getLS<Product[]>("apniDukan_products", []),
  );
  const categories = getLS<Category[]>("apniDukan_categories", []);

  // Form state
  const [name, setName] = useState("");
  const [features, setFeatures] = useState("");
  const [price, setPrice] = useState("");
  const [cutPrice, setCutPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [availability, setAvailability] = useState<
    "available" | "out_of_stock"
  >("available");
  const [categoryId, setCategoryId] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setName("");
    setFeatures("");
    setPrice("");
    setCutPrice("");
    setDiscount("");
    setAvailability("available");
    setCategoryId("");
    setPhotos([]);
  }

  function loadForEdit(product: Product) {
    setEditProduct(product);
    setName(product.name);
    setFeatures(product.features);
    setPrice(String(product.price));
    setCutPrice(String(product.cutPrice));
    setDiscount(String(product.discount));
    setAvailability(product.availability);
    setCategoryId(product.categoryId);
    setPhotos(product.photos);
    setView("edit");
  }

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () =>
        setPhotos((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  function saveProduct() {
    if (!name.trim()) {
      toast.error("Product name required");
      return;
    }
    if (!price || Number.isNaN(Number(price))) {
      toast.error("Valid price required");
      return;
    }

    const newProduct: Product = {
      id: editProduct ? editProduct.id : `prod_${Date.now()}`,
      name: name.trim(),
      features: features.trim(),
      price: Number(price),
      cutPrice: Number(cutPrice) || 0,
      discount: Number(discount) || 0,
      availability,
      categoryId,
      photos,
      createdAt: editProduct ? editProduct.createdAt : new Date().toISOString(),
    };

    const all = getLS<Product[]>("apniDukan_products", []);
    if (editProduct) {
      const updated = all.map((p) =>
        p.id === editProduct.id ? newProduct : p,
      );
      setProducts(updated);
      setLS("apniDukan_products", updated);
      toast.success("Product updated!");
    } else {
      const updated = [...all, newProduct];
      setProducts(updated);
      setLS("apniDukan_products", updated);
      toast.success("Product added!");
    }
    resetForm();
    setEditProduct(null);
    setView("list");
  }

  function deleteProduct(id: string) {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    setLS("apniDukan_products", updated);
    toast.success("Product deleted");
    setView("list");
  }

  if (view === "list") {
    return (
      <div className="flex flex-col h-full relative">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <h2 className="font-bold text-gray-800">Products</h2>
          <span className="text-xs text-gray-500">{products.length} items</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {products.length === 0 ? (
            <p
              data-ocid="owner_products.empty_state"
              className="text-sm text-gray-400 text-center py-12"
            >
              No products yet. Add your first product!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((p, idx) => (
                <button
                  type="button"
                  key={p.id}
                  data-ocid={`owner_products.item.${idx + 1}`}
                  onClick={() => loadForEdit(p)}
                  className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-left"
                >
                  {p.photos[0] ? (
                    <img
                      src={p.photos[0]}
                      alt={p.name}
                      className="w-14 h-14 object-contain rounded bg-gray-50"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      ₹{p.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      p.availability === "available" ? "default" : "destructive"
                    }
                    className="text-xs flex-shrink-0"
                  >
                    {p.availability === "available" ? "In Stock" : "OOS"}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          data-ocid="owner_products.open_modal_button"
          onClick={() => {
            resetForm();
            setEditProduct(null);
            setView("add");
          }}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center text-2xl"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setView("list");
            }}
            className="text-primary"
          >
            ←
          </button>
          <h2 className="font-bold text-gray-800">
            {view === "add" ? "Add Product" : "Edit Product"}
          </h2>
        </div>
        {view === "edit" && editProduct && (
          <button
            type="button"
            data-ocid="owner_products.delete_button"
            onClick={() => deleteProduct(editProduct.id)}
            className="text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Photos */}
        <div className="mb-4">
          <Label className="text-xs font-bold uppercase">Photos</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {photos.map((photo, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable photo list
              <div key={i} className="relative">
                <img
                  src={photo}
                  alt={`${i + 1}`}
                  className="w-16 h-16 object-contain rounded border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPhotos(photos.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              data-ocid="owner_products.upload_button"
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-2xl"
            >
              +
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileRef}
            onChange={handlePhotoAdd}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="p-name">Product Name *</Label>
            <Input
              id="p-name"
              data-ocid="owner_products.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="p-features">Features / Description</Label>
            <Textarea
              id="p-features"
              data-ocid="owner_products.textarea"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-price">Price (₹) *</Label>
              <Input
                id="p-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="p-cutprice">Cut Price (₹)</Label>
              <Input
                id="p-cutprice"
                type="number"
                value={cutPrice}
                onChange={(e) => setCutPrice(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="p-discount">Discount %</Label>
            <Input
              id="p-discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Availability</Label>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                data-ocid="owner_products.available.toggle"
                onClick={() => setAvailability("available")}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold ${
                  availability === "available"
                    ? "border-primary text-primary"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Available
              </button>
              <button
                type="button"
                data-ocid="owner_products.outofstock.toggle"
                onClick={() => setAvailability("out_of_stock")}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold ${
                  availability === "out_of_stock"
                    ? "border-destructive text-destructive"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="p-cat">Category</Label>
            <select
              id="p-cat"
              data-ocid="owner_products.select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            data-ocid="owner_products.save_button"
            onClick={saveProduct}
            className="w-full h-12 font-bold"
          >
            {view === "add" ? "Add Product" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
