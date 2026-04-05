import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type {
  AppSettings,
  CartItem,
  Customer,
  Order,
  OrderItem,
  Product,
} from "../../types";

type Step = "details" | "payment" | "qr" | "screenshot" | "success";

interface CheckoutPageProps {
  customer: Customer;
  onBack: () => void;
  onSuccess: () => void;
}

export default function CheckoutPage({
  customer,
  onBack,
  onSuccess,
}: CheckoutPageProps) {
  const [step, setStep] = useState<Step>("details");
  const [editName, setEditName] = useState(customer.name);
  const [editPhone, setEditPhone] = useState(customer.mobile);
  const [editAddress, setEditAddress] = useState(customer.address);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const settings = getLS<AppSettings>("apniDukan_settings", {
    phone: "9120499453",
    email: "apni.dukan.0704@gmail.com",
    paymentQR: "",
    ownerPassword: "07041845",
    ownerNames: [],
    theme: "blue",
  });

  function buildOrderItems(): OrderItem[] {
    const cart = getLS<CartItem[]>(`apniDukan_cart_${customer.id}`, []);
    const products = getLS<Product[]>("apniDukan_products", []);
    return cart
      .map((ci) => {
        const p = products.find((pr) => pr.id === ci.productId);
        return {
          productId: ci.productId,
          productName: p?.name ?? "Unknown",
          productPhoto: p?.photos[0] ?? "",
          productFeatures: p?.features ?? "",
          price: p?.price ?? 0,
          quantity: ci.quantity,
        };
      })
      .filter((i) => i.price > 0);
  }

  function placeOrder(method: "cod" | "online", proof?: string) {
    const items = buildOrderItems();
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order: Order = {
      id: `ord_${Date.now()}`,
      customerId: customer.id,
      customerName: editName,
      customerPhone: editPhone,
      customerAddress: editAddress,
      items,
      totalPrice: total,
      paymentMethod: method,
      paymentProof: proof,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const orders = getLS<Order[]>("apniDukan_orders", []);
    setLS("apniDukan_orders", [...orders, order]);
    setLS(`apniDukan_cart_${customer.id}`, []);
    setStep("success");
    setTimeout(() => {
      toast.success(
        "Your product is successfully ordered. Please tap our logo to track your order.",
        { duration: 4000 },
      );
      onSuccess();
    }, 1500);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPaymentProof(reader.result as string);
    reader.readAsDataURL(file);
  }

  if (step === "success") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 max-w-[480px] mx-auto px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">
            Order Placed!
          </h2>
          <p className="text-sm text-gray-500">Returning to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[480px] mx-auto">
      <header className="sticky top-0 z-10 bg-white shadow-sm flex items-center px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-primary font-medium"
        >
          ← Back
        </button>
        <h1 className="font-bold text-gray-900 ml-4">
          {step === "details" && "Confirm Details"}
          {step === "payment" && "Payment"}
          {step === "qr" && "Pay Online"}
          {step === "screenshot" && "Upload Proof"}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {step === "details" && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">Delivery Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  data-ocid="checkout.name.input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  data-ocid="checkout.phone.input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="checkout-address">Address</Label>
                <textarea
                  id="checkout-address"
                  data-ocid="checkout.address.textarea"
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-gray-800 mb-2">
              Select Payment Method
            </h2>
            <button
              type="button"
              data-ocid="checkout.cod.button"
              onClick={() => placeOrder("cod")}
              className="w-full bg-white border-2 rounded-xl p-5 text-left hover:border-primary transition-colors"
            >
              <p className="font-bold text-gray-800">Cash on Delivery</p>
              <p className="text-sm text-gray-500 mt-1">
                Pay when your order arrives
              </p>
            </button>
            <button
              type="button"
              data-ocid="checkout.online.button"
              onClick={() => setStep("qr")}
              className="w-full bg-white border-2 rounded-xl p-5 text-left hover:border-primary transition-colors"
            >
              <p className="font-bold text-gray-800">Online Payment</p>
              <p className="text-sm text-gray-500 mt-1">Pay via UPI/QR code</p>
            </button>
          </div>
        )}

        {step === "qr" && (
          <div className="flex flex-col items-center gap-5">
            <h2 className="font-bold text-gray-800">Scan QR to Pay</h2>
            {settings.paymentQR ? (
              <img
                src={settings.paymentQR}
                alt="Payment QR"
                className="w-48 h-48 object-contain border rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 border-2 border-dashed rounded-xl flex items-center justify-center">
                <p className="text-sm text-gray-400 text-center px-4">
                  No QR set yet. Contact owner at 9120499453
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 text-center">
              After paying, tap CONFIRM below
            </p>
            <Button
              type="button"
              data-ocid="checkout.qr.confirm_button"
              onClick={() => setStep("screenshot")}
              className="w-full h-12 font-bold"
            >
              Confirm Payment Made
            </Button>
          </div>
        )}

        {step === "screenshot" && (
          <div className="flex flex-col items-center gap-5">
            <h2 className="font-bold text-gray-800">
              Upload Payment Screenshot
            </h2>
            <p className="text-sm text-gray-500 text-center">
              Please insert your payment screenshot
            </p>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {paymentProof ? (
              <img
                src={paymentProof}
                alt="proof"
                className="w-48 object-contain rounded-xl border"
              />
            ) : (
              <div className="w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center">
                <p className="text-sm text-gray-400">No screenshot selected</p>
              </div>
            )}
            <Button
              type="button"
              data-ocid="checkout.screenshot.upload_button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="w-full h-12 font-bold"
            >
              Insert Screenshot
            </Button>
            {paymentProof && (
              <Button
                type="button"
                data-ocid="checkout.screenshot.confirm_button"
                onClick={() => placeOrder("online", paymentProof ?? undefined)}
                className="w-full h-12 font-bold"
              >
                Confirm Order
              </Button>
            )}
          </div>
        )}
      </main>

      {step === "details" && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t p-4">
          <Button
            type="button"
            data-ocid="checkout.next.primary_button"
            onClick={() => setStep("payment")}
            className="w-full h-12 font-bold text-base"
          >
            Confirm &amp; Continue
          </Button>
        </div>
      )}
    </div>
  );
}
