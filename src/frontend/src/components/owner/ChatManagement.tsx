import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { ChatMessage, Customer } from "../../types";

interface ChatManagementProps {
  onBack: () => void;
}

export default function ChatManagement({
  onBack: _onBack,
}: ChatManagementProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const allMessages = getLS<ChatMessage[]>("apniDukan_messages", []);
  const customers = getLS<Customer[]>("apniDukan_customers", []);
  const customerIds = [...new Set(allMessages.map((m) => m.customerId))];
  const chats = customerIds
    .map((id) => customers.find((c) => c.id === id))
    .filter(Boolean) as Customer[];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  function openChat(customer: Customer) {
    setSelectedCustomer(customer);
    setMessages(
      getLS<ChatMessage[]>("apniDukan_messages", []).filter(
        (m) => m.customerId === customer.id,
      ),
    );
  }

  function sendReply() {
    if (!text.trim() || !selectedCustomer) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      customerId: selectedCustomer.id,
      senderRole: "owner",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const all = getLS<ChatMessage[]>("apniDukan_messages", []);
    const updated = [...all, msg];
    setLS("apniDukan_messages", updated);
    setMessages(updated.filter((m) => m.customerId === selectedCustomer.id));
    setText("");
  }

  if (selectedCustomer) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
          <button
            type="button"
            onClick={() => setSelectedCustomer(null)}
            className="text-primary"
          >
            ←
          </button>
          <p className="font-bold text-gray-800">{selectedCustomer.name}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              data-ocid={`owner_chat.item.${idx + 1}`}
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.senderRole === "owner"
                  ? "bg-primary text-primary-foreground self-end rounded-br-sm"
                  : "bg-gray-100 self-start rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <Input
            data-ocid="owner_chat.input"
            placeholder="Reply..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendReply()}
            className="flex-1"
          />
          <Button
            type="button"
            data-ocid="owner_chat.submit_button"
            onClick={sendReply}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-white">
        <h2 className="font-bold text-gray-800">Customer Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {chats.length === 0 ? (
          <p
            data-ocid="owner_chat.empty_state"
            className="text-sm text-gray-400 text-center py-12"
          >
            No conversations yet
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {chats.map((customer, idx) => {
              const lastMsg = allMessages
                .filter((m) => m.customerId === customer.id)
                .at(-1);
              return (
                <button
                  type="button"
                  key={customer.id}
                  data-ocid={`owner_chat.item.${idx + 1}`}
                  onClick={() => openChat(customer)}
                  className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-3 border text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                    {customer.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      {customer.name}
                    </p>
                    {lastMsg && (
                      <p className="text-xs text-gray-500 truncate">
                        {lastMsg.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
