import React, { useState, useRef, useEffect } from "react";
import apiClient from "../services/api";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      // The backend proxies the AI model, so no API key is shipped to the browser.
      const response = await apiClient.post("/chat", { message: userMessage });
      const botMessage =
        response.data?.data?.reply || "Sorry, I couldn't generate a response.";

      setMessages((prev) => [...prev, { type: "bot", text: botMessage }]);
    } catch (error) {
      const status = error.response?.status;
      const text =
        status === 503
          ? "The chat assistant is offline right now. Please use the contact form and our team will get back to you."
          : status === 429
            ? "You've sent a lot of messages. Please wait a few minutes and try again."
            : "Sorry, I couldn't reach the assistant. Please try again later or use the contact form.";
      setMessages((prev) => [...prev, { type: "bot", text }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. CLOSED STATE: Green Circular Button (Matches Figma) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#84cc16] shadow-[0_8px_20px_-6px_rgba(132,204,22,0.5)] transition hover:scale-110"
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* 2. OPEN STATE: Chat Window (Matches Figma) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex h-[500px] w-[340px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          {/* Header: White background, Green Icon, Gray text */}
          <div className="flex items-center justify-between bg-white border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#84cc16] rounded-full p-2">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-slate-700">
                Ever Zone chatbot
              </h2>
            </div>
            <button
              onClick={toggleChat}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto bg-white p-5 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    message.type === "user"
                      ? "bg-[#113243] text-white rounded-br-sm" // Dark blue for User
                      : "bg-[#f3f4f6] text-slate-700 rounded-bl-sm" // Light gray for Bot
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f3f4f6] px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input: Paper-plane icon */}
          <form
            onSubmit={sendMessage}
            className="bg-white border-t border-slate-100 p-4"
          >
            <div className="flex items-center gap-2 border border-slate-200 rounded-full px-4 py-1.5 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#84cc16]/20 focus-within:border-[#84cc16]">
              <input
                type="text"
                placeholder="Enter your message"
                className="flex-1 bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 text-slate-400 transition hover:text-[#84cc16] disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
