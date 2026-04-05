import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { ChatMessage, Customer } from "../../types";

interface ChatPageProps {
  customer: Customer;
  onBack: () => void;
}

export default function ChatPage({ customer, onBack }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getLS<ChatMessage[]>("apniDukan_messages", []).filter(
      (m) => m.customerId === customer.id,
    ),
  );
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  function sendMessage() {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      customerId: customer.id,
      senderRole: "customer",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const all = getLS<ChatMessage[]>("apniDukan_messages", []);
    const updated = [...all, msg];
    setLS("apniDukan_messages", updated);
    setMessages(updated.filter((m) => m.customerId === customer.id));
    setText("");
  }

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
        <div>
          <p className="font-bold text-gray-900">Owner</p>
          <p className="text-xs text-gray-500">Apni Dukan</p>
        </div>
      </header>

      <main
        data-ocid="customer_chat.panel"
        className="flex-1 overflow-y-auto px-4 py-4 pb-24 flex flex-col gap-3"
      >
        {messages.length === 0 && (
          <p
            data-ocid="customer_chat.empty_state"
            className="text-sm text-gray-400 text-center mt-8"
          >
            Start a conversation with the owner
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            data-ocid={`customer_chat.item.${idx + 1}`}
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.senderRole === "customer"
                ? "bg-primary text-primary-foreground self-end rounded-br-sm"
                : "bg-white border self-start rounded-bl-sm"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t p-3 flex gap-2">
        <Input
          data-ocid="customer_chat.input"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
        />
        <Button
          type="button"
          data-ocid="customer_chat.submit_button"
          onClick={sendMessage}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
