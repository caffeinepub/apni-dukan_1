import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  SiFacebook,
  SiGoogle,
  SiInstagram,
  SiWhatsapp,
  SiYoutube,
} from "react-icons/si";
import { toast } from "sonner";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type {
  Advertisement,
  AppSettings,
  CartItem,
  Category,
  Customer,
  Order,
  Product,
} from "../../types";

const THEMES: Record<string, string> = {
  blue: "0.55 0.18 250",
  red: "0.55 0.22 25",
  green: "0.55 0.18 145",
  darkblue: "0.35 0.16 260",
  black: "0.2 0 0",
  orange: "0.6 0.2 55",
};

interface CustomerDashboardProps {
  customer: Customer;
  onProductDetail: (product: Product) => void;
  onCart: () => void;
  onChat: () => void;
  onLogout: () => void;
  onOrdersUpdate: () => void;
}

export default function CustomerDashboard({
  customer,
  onProductDetail,
  onCart,
  onChat,
  onLogout,
}: CustomerDashboardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<
    "menu" | "themes" | "orders" | "category" | "profile"
  >("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [adIndex, setAdIndex] = useState(0);
  const [theme, setTheme] = useState(() =>
    getLS<string>(`apniDukan_customerTheme_${customer.id}`, "blue"),
  );
  const [profileName, setProfileName] = useState(customer.name);
  const [profileMobile, setProfileMobile] = useState(customer.mobile);
  const [profileAddress, setProfileAddress] = useState(customer.address);

  const products = getLS<Product[]>("apniDukan_products", []);
  const ads = getLS<Advertisement[]>("apniDukan_ads", []);
  const settings = getLS<AppSettings>("apniDukan_settings", {
    phone: "9120499453",
    email: "apni.dukan.0704@gmail.com",
    paymentQR: "",
    ownerPassword: "07041845",
    ownerNames: [],
    theme: "blue",
  });
  const categories = getLS<Category[]>("apniDukan_categories", []);
  const orders = getLS<Order[]>("apniDukan_orders", []).filter(
    (o) => o.customerId === customer.id,
  );
  const cartItems = getLS<CartItem[]>(`apniDukan_cart_${customer.id}`, []);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const themeOklch = THEMES[theme] ?? THEMES.blue;
    document.documentElement.style.setProperty("--primary", themeOklch);
    setLS(`apniDukan_customerTheme_${customer.id}`, theme);
  }, [theme, customer.id]);

  useEffect(() => {
    if (ads.length > 1) {
      adTimerRef.current = setInterval(() => {
        setAdIndex((prev) => (prev + 1) % ads.length);
      }, 4000);
    }
    return () => {
      if (adTimerRef.current) clearInterval(adTimerRef.current);
    };
  }, [ads.length]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.features?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function addToCart(product: Product) {
    const cart = getLS<CartItem[]>(`apniDukan_cart_${customer.id}`, []);
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      const updated = cart.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
      );
      setLS(`apniDukan_cart_${customer.id}`, updated);
    } else {
      setLS(`apniDukan_cart_${customer.id}`, [
        ...cart,
        { productId: product.id, quantity: 1 },
      ]);
    }
    toast.success("Added to cart!");
  }

  function saveProfile() {
    const customers = getLS<Customer[]>("apniDukan_customers", []);
    const updated = customers.map((c) =>
      c.id === customer.id
        ? {
            ...c,
            name: profileName,
            mobile: profileMobile,
            address: profileAddress,
          }
        : c,
    );
    setLS("apniDukan_customers", updated);
    customer.name = profileName;
    customer.mobile = profileMobile;
    customer.address = profileAddress;
    toast.success("Profile updated!");
  }

  function cancelOrder(orderId: string) {
    const allOrders = getLS<Order[]>("apniDukan_orders", []);
    const updated = allOrders.map((o) =>
      o.id === orderId && o.status === "pending"
        ? { ...o, status: "cancelled" as const }
        : o,
    );
    setLS("apniDukan_orders", updated);
    toast.success("Order cancelled");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[480px] mx-auto relative">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 bg-white shadow-sm flex items-center justify-between px-4 py-2">
        <button
          type="button"
          data-ocid="customer_dashboard.logo.button"
          onClick={() => {
            setDrawerOpen(true);
            setDrawerView("menu");
          }}
          className="flex items-center gap-2"
        >
          <img
            src="/assets/img-20260403-wa0000-019d5212-163d-7239-b20a-489c5dd03af6.jpg"
            alt="logo"
            className="rounded-full object-contain bg-white border border-gray-200"
            style={{ width: 36, height: 36 }}
          />
          <div className="text-left">
            <p className="text-sm font-extrabold text-gray-900 leading-tight">
              Apni Dukan
            </p>
            <p className="text-[10px] text-primary leading-tight">
              Online Se Sasta
            </p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="customer_dashboard.chat.button"
            onClick={onChat}
            className="relative"
          >
            <MessageCircle className="w-6 h-6 text-gray-700" />
          </button>
          <button
            type="button"
            data-ocid="customer_dashboard.cart.button"
            onClick={onCart}
            className="relative"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {cartCount}
              </Badge>
            )}
          </button>
        </div>
      </header>

      {/* Side Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col"
              data-ocid="customer_dashboard.panel"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-bold text-gray-800">
                  {drawerView !== "menu" && (
                    <button
                      type="button"
                      onClick={() => setDrawerView("menu")}
                      className="mr-2 text-primary"
                    >
                      ←
                    </button>
                  )}
                  {drawerView === "menu" && "Menu"}
                  {drawerView === "themes" && "Themes"}
                  {drawerView === "orders" && "My Orders"}
                  {drawerView === "category" && "Categories"}
                  {drawerView === "profile" && "Profile"}
                </span>
                <button type="button" onClick={() => setDrawerOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {drawerView === "menu" && (
                <nav className="flex flex-col py-4">
                  {["themes", "orders", "category", "profile"].map((item) => (
                    <button
                      type="button"
                      key={item}
                      data-ocid={`customer_dashboard.${item}.link`}
                      onClick={() => setDrawerView(item as typeof drawerView)}
                      className="px-6 py-3 text-left text-gray-700 font-medium hover:bg-gray-50 capitalize"
                    >
                      {item === "orders"
                        ? "Orders"
                        : item === "themes"
                          ? "Themes"
                          : item === "category"
                            ? "Category"
                            : "Profile"}
                    </button>
                  ))}
                  <button
                    type="button"
                    data-ocid="customer_dashboard.logout.button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onLogout();
                    }}
                    className="px-6 py-3 text-left text-red-500 font-medium hover:bg-red-50 mt-2"
                  >
                    Logout
                  </button>
                </nav>
              )}

              {drawerView === "themes" && (
                <div className="p-4 flex flex-col gap-3">
                  {Object.entries(THEMES).map(([name, oklch]) => (
                    <button
                      type="button"
                      key={name}
                      data-ocid="customer_dashboard.theme.toggle"
                      onClick={() => setTheme(name)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${
                        theme === name ? "border-primary" : "border-gray-200"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ background: `oklch(${oklch})` }}
                      />
                      <span className="capitalize font-medium">
                        {name.replace("darkblue", "Dark Blue")}
                      </span>
                      {theme === name && (
                        <span className="ml-auto text-primary font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {drawerView === "orders" && (
                <div className="flex-1 overflow-y-auto p-4">
                  {orders.length === 0 ? (
                    <p
                      data-ocid="customer_orders.empty_state"
                      className="text-sm text-gray-500 text-center mt-8"
                    >
                      No orders yet
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {orders.map((order, idx) => (
                        <div
                          key={order.id}
                          data-ocid={`customer_orders.item.${idx + 1}`}
                          className="border rounded-xl p-3 bg-white shadow-sm"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            {order.items[0]?.productPhoto && (
                              <img
                                src={order.items[0].productPhoto}
                                alt="product"
                                className="w-12 h-12 object-contain rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800">
                                {order.items[0]?.productName}
                              </p>
                              {order.items.length > 1 && (
                                <p className="text-xs text-gray-500">
                                  +{order.items.length - 1} more items
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                ₹{order.totalPrice.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {order.customerAddress}
                          </p>
                          {order.status === "accepted" && (
                            <p className="text-xs text-green-600 font-medium">
                              Order Accepted. Your order is on the way. For
                              other details please contact owner at 9120499453
                            </p>
                          )}
                          {order.status === "cancelled" && (
                            <p className="text-xs text-red-500 font-medium">
                              Order Cancelled. Please contact owner at
                              9120499453
                            </p>
                          )}
                          {order.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Pending</Badge>
                              <button
                                type="button"
                                data-ocid={`customer_orders.delete_button.${idx + 1}`}
                                onClick={() => cancelOrder(order.id)}
                                className="text-xs text-red-500 underline"
                              >
                                Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {drawerView === "category" && (
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat, idx) => (
                      <div
                        key={cat.id}
                        data-ocid={`category.item.${idx + 1}`}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <p className="text-[9px] font-bold text-gray-700 text-center leading-tight">
                          {cat.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerView === "profile" && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label
                        htmlFor="profile-name"
                        className="text-xs font-bold text-gray-500 uppercase block mb-1"
                      >
                        Name
                      </label>
                      <input
                        id="profile-name"
                        data-ocid="customer_profile.input"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-mobile"
                        className="text-xs font-bold text-gray-500 uppercase block mb-1"
                      >
                        Mobile
                      </label>
                      <input
                        id="profile-mobile"
                        data-ocid="customer_profile.mobile.input"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={profileMobile}
                        onChange={(e) => setProfileMobile(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-address"
                        className="text-xs font-bold text-gray-500 uppercase block mb-1"
                      >
                        Address
                      </label>
                      <textarea
                        id="profile-address"
                        data-ocid="customer_profile.address.textarea"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={3}
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      data-ocid="customer_profile.save_button"
                      onClick={saveProfile}
                      className="w-full"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 pt-4">
          <p className="text-base font-bold text-gray-800 mb-3">
            Hello {customer.name},
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              data-ocid="customer_dashboard.search_input"
              placeholder="Search products or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Ad Banner */}
          <div
            data-ocid="customer_dashboard.card"
            className="rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-primary to-blue-600 relative"
            style={{ height: "25vh", minHeight: 120 }}
          >
            {ads.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-xl font-extrabold">Apni Dukan</p>
                  <p className="text-sm opacity-80">Best Deals Online!</p>
                  <p className="text-xs opacity-60 mt-1">Online Se Sasta</p>
                </div>
              </div>
            ) : ads[adIndex]?.type === "image" ? (
              <img
                src={ads[adIndex].data}
                alt="ad"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={ads[adIndex]?.data}
                autoPlay
                muted
                className="w-full h-full object-cover"
              >
                <track kind="captions" />
              </video>
            )}
            {ads.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {ads.map((ad, i) => (
                  <button
                    type="button"
                    key={ad.id}
                    onClick={() => setAdIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === adIndex ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 && searchQuery && (
            <p
              data-ocid="products.empty_state"
              className="text-sm text-gray-500 text-center py-8"
            >
              No products found for &quot;{searchQuery}&quot;
            </p>
          )}
          {filteredProducts.length === 0 && !searchQuery && (
            <p
              data-ocid="products.empty_state"
              className="text-sm text-gray-500 text-center py-12"
            >
              No products yet. Check back soon!
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                data-ocid={`products.item.${idx + 1}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 cursor-pointer"
                onClick={() => onProductDetail(product)}
              >
                <div className="relative">
                  {product.photos[0] ? (
                    <img
                      src={product.photos[0]}
                      alt={product.name}
                      className="w-full h-36 object-contain bg-gray-50"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                  )}
                  {product.availability === "out_of_stock" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  {product.discount > 0 && (
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 bg-green-500 text-white border-0">
                      {product.discount}% off
                    </Badge>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-extrabold text-primary">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.cutPrice > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.cutPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    data-ocid={`products.button.${idx + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.availability === "available")
                        addToCart(product);
                    }}
                    className={`mt-2 w-full text-xs font-bold py-1.5 rounded-lg ${
                      product.availability === "available"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-200 text-gray-500 cursor-default"
                    }`}
                  >
                    {product.availability === "available"
                      ? "Add to Cart"
                      : "Notify Me"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Footer */}
        <footer className="mt-8 px-4 py-6 bg-gray-900 text-white">
          <p className="text-center font-extrabold text-sm uppercase tracking-widest mb-4">
            Contact Us
          </p>
          <div className="flex flex-col gap-3 mb-5">
            <a
              href={`tel:${settings.phone}`}
              data-ocid="footer.phone.link"
              className="flex items-center gap-3 text-sm"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span>{settings.phone}</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              data-ocid="footer.email.link"
              className="flex items-center gap-3 text-sm"
            >
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs break-all">{settings.email}</span>
            </a>
            <a
              href="https://maps.app.goo.gl/sBixRakF6z955rPMA?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.location.link"
              className="flex items-center gap-3 text-sm"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span>Our Location</span>
            </a>
          </div>
          <p className="text-center text-xs text-gray-400 mb-3 uppercase tracking-widest">
            Follow Us ↓
          </p>
          <div className="flex justify-center gap-5">
            <a
              href="https://www.instagram.com/apni_dukan.7?igsh=MTFkMGF3eXg0YWNudQ=="
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.instagram.link"
            >
              <SiInstagram className="w-7 h-7 text-pink-400 hover:text-pink-300" />
            </a>
            <a
              href="https://youtube.com/@apnidukan-r9s?si=M47y2xY9DTXIVkko"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.youtube.link"
            >
              <SiYoutube className="w-7 h-7 text-red-400 hover:text-red-300" />
            </a>
            <a
              href="https://www.facebook.com/share/1HDi83TVgh/"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.facebook.link"
            >
              <SiFacebook className="w-7 h-7 text-blue-400 hover:text-blue-300" />
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb7ZAGS6xCSU7c1jH03U"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.whatsapp.link"
            >
              <SiWhatsapp className="w-7 h-7 text-green-400 hover:text-green-300" />
            </a>
            <a
              href="https://share.google/Zg5a9k3cyVcbSLP0q"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.google.link"
            >
              <SiGoogle className="w-7 h-7 text-yellow-400 hover:text-yellow-300" />
            </a>
          </div>
          <p className="text-center text-[10px] text-gray-500 mt-6">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
