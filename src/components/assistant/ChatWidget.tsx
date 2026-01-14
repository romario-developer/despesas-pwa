import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import ChatMessageBubble from "./ChatMessageBubble";
import { useAssistantChat } from "../../hooks/useAssistantChat";

const ASSISTANT_CHAT_OPEN_KEY = "assistantChatOpen";

const readAssistantChatOpenPreference = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ASSISTANT_CHAT_OPEN_KEY) === "true";
};

const QUICK_SUGGESTIONS = [
  "Quanto gastei esse mês?",
  "Desfazer último",
  "Registrar receita",
];

const ChatWidget = () => {
  const {
    messages,
    loading,
    error,
    suggestions,
    sendMessage,
    lastUserMessage,
    resetConversation,
  } = useAssistantChat();
  const [inputValue, setInputValue] = useState("");
  const [chatOpen, setChatOpen] = useState(() =>
    readAssistantChatOpenPreference(),
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      ASSISTANT_CHAT_OPEN_KEY,
      chatOpen ? "true" : "false",
    );
  }, [chatOpen]);

  const handleCloseChat = () => {
    setInputValue("");
    setChatOpen(false);
  };

  const handleOpenChat = () => setChatOpen(true);

  const handleClearConversation = () => {
    resetConversation();
    setInputValue("");
    setChatOpen(false);
  };

  const allSuggestions = useMemo(
    () => Array.from(new Set([...(suggestions ?? []), ...QUICK_SUGGESTIONS])),
    [suggestions],
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    await sendMessage(text);
    setInputValue("");
    scrollToBottom();
  };

  const handleSuggestion = (value: string) => {
    sendMessage(value);
    setInputValue("");
    scrollToBottom();
  };

  const handleUndo = () => {
    sendMessage("Desfazer último");
    scrollToBottom();
  };

  const handleCorrect = () => {
    const correction = lastUserMessage
      ? `na verdade ${lastUserMessage}`
      : "na verdade ";
    setInputValue(correction);
  };

  const renderContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Assistente
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
          >
            Desfazer último
          </button>
          <button
            type="button"
            onClick={handleClearConversation}
            className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={handleCloseChat}
            aria-label="Fechar chat"
            className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3" aria-live="polite">
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}
        {loading && (
          <p className="text-xs text-slate-500">Assistente está digitando...</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="space-y-2 border-t border-slate-200 px-4 py-3">
        {error && (
          <p className="text-xs text-rose-600">
            {error}
          </p>
        )}
        <form onSubmit={handleSend} className="space-y-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Digite algo como: ‘gastei 50 no mercado’"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              Enviar
            </button>
            <button
              type="button"
              onClick={handleCorrect}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-primary hover:text-primary"
            >
              Corrigir último
            </button>
          </div>
        </form>
        <div className="flex flex-wrap gap-2">
          {allSuggestions.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => handleSuggestion(text)}
              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex">
        <button
          type="button"
          onClick={handleOpenChat}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/40"
        >
          Assistente
        </button>
      </div>

      {chatOpen && (
        <div className="fixed inset-0 z-40 flex sm:hidden">
          <div className="flex h-full w-full flex-col border border-slate-200 bg-white shadow-xl">
            {renderContent()}
          </div>
        </div>
      )}

      {chatOpen && (
        <div className="hidden sm:flex">
          <div className="fixed bottom-4 right-4 top-16 z-30 w-80 rounded-3xl border border-slate-200 bg-white shadow-lg">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
