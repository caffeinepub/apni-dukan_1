import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { Order } from "../../types";

interface OrderManagementProps {
  onBack: () => void;
}

export default function OrderManagement({
  onBack: _onBack,
}: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>(() =>
    getLS<Order[]>("apniDukan_orders", []).slice().reverse(),
  );
  const [selected, setSelected] = useState<Order | null>(null);
  const [showProof, setShowProof] = useState(false);

  function updateStatus(orderId: string, status: "accepted" | "cancelled") {
    const all = getLS<Order[]>("apniDukan_orders", []);
    const updated = all.map((o) => (o.id === orderId ? { ...o, status } : o));
    setLS("apniDukan_orders", updated);
    setOrders(updated.slice().reverse());
    setSelected((prev) => (prev ? { ...prev, status } : null));
    toast.success(
      status === "accepted" ? "Order accepted!" : "Order cancelled",
    );
  }

  const statusColor = (status: Order["status"]) => {
    if (status === "accepted") return "default" as const;
    if (status === "cancelled") return "destructive" as const;
    return "secondary" as const;
  };

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setShowProof(false);
            }}
            className="text-primary"
          >
            ← Back
          </button>
          <h2 className="font-bold text-gray-800">Order Detail</h2>
          <Badge variant={statusColor(selected.status)} className="text-xs">
            {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {selected.items.map((item, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable order items
            <div key={idx} className="flex gap-3 mb-4 pb-4 border-b">
              {item.productPhoto && (
                <img
                  src={item.productPhoto}
                  alt={item.productName}
                  className="w-16 h-16 object-contain rounded bg-gray-50"
                />
              )}
              <div>
                <p className="font-bold text-sm">{item.productName}</p>
                <p className="text-xs text-gray-500">
                  {item.productFeatures?.slice(0, 60)}
                  {item.productFeatures?.length > 60 ? "..." : ""}
                </p>
                <p className="text-sm font-bold text-primary">
                  ₹{item.price.toLocaleString("en-IN")} x {item.quantity}
                </p>
              </div>
            </div>
          ))}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-gray-500 mb-2">
              CUSTOMER DETAILS
            </p>
            <p className="text-sm">{selected.customerName}</p>
            <p className="text-sm text-gray-600">{selected.customerPhone}</p>
            <p className="text-sm text-gray-600 mt-1">
              {selected.customerAddress}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-gray-500 mb-2">PAYMENT</p>
            <Badge variant="outline" className="capitalize">
              {selected.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}
            </Badge>
            {selected.paymentMethod === "online" && selected.paymentProof && (
              <>
                <Button
                  type="button"
                  data-ocid="owner_orders.proof.button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProof(!showProof)}
                  className="mt-2 ml-2"
                >
                  {showProof ? "Hide Proof" : "View Proof"}
                </Button>
                {showProof && (
                  <img
                    src={selected.paymentProof}
                    alt="payment proof"
                    className="mt-3 w-full rounded-xl border"
                  />
                )}
              </>
            )}
          </div>
          <div className="text-right mb-6">
            <span className="text-lg font-extrabold text-primary">
              Total: ₹{selected.totalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        {selected.status === "pending" && (
          <div className="flex gap-3 px-4 pb-6">
            <Button
              type="button"
              data-ocid="owner_orders.cancel_button"
              variant="destructive"
              onClick={() => updateStatus(selected.id, "cancelled")}
              className="flex-1 h-12 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="owner_orders.confirm_button"
              onClick={() => updateStatus(selected.id, "accepted")}
              className="flex-1 h-12 font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              Accept
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h2 className="font-bold text-gray-800">Orders</h2>
        <span className="text-xs text-gray-500">{orders.length} orders</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {orders.length === 0 ? (
          <p
            data-ocid="owner_orders.empty_state"
            className="text-sm text-gray-400 text-center py-12"
          >
            No orders yet
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order, idx) => (
              <button
                type="button"
                key={order.id}
                data-ocid={`owner_orders.item.${idx + 1}`}
                onClick={() => setSelected(order)}
                className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {order.customerName}
                    </p>
                    <Badge
                      variant={statusColor(order.status)}
                      className="text-[10px] px-1"
                    >
                      {order.status === "accepted"
                        ? "Approved"
                        : order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {order.items.map((i) => i.productName).join(", ")}
                  </p>
                  <p className="text-xs font-bold text-primary">
                    ₹{order.totalPrice.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
