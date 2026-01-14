import { useCallback, useMemo, useState } from "react";
import { notifyEntriesChanged } from "../utils/entriesEvents";
import { getCurrentMonthInTimeZone } from "../utils/months";
import { chatWithAssistant } from "../api/assistant";
import type { AssistantAction } from "../api/assistant";
import { formatCurrency } from "../utils/format";

const STORAGE_KEY = "assistant_conversation_id";

export type ChatMessage = {
  id: string;
  author: "user" | "assistant" | "summary";
  text: string;
};

type SendOptions = {
  onActions?: (actions: AssistantAction[]) => void;
};

const defaultSuggestions = [
  "Quanto gastei esse mÃªs?",
  "Desfazer Ãºltimo",
  "Registrar receita",
];

const ASSISTANT_FALLBACK_MESSAGE = "Assistente respondeu em um formato inesperado. Tente novamente.";

const normalizeAssistantText = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
};

const formatActionSummary = (action: AssistantAction): string | null => {
  const summary = action.summary;
  if (!summary) return null;

  if (typeof summary === "string") {
    const trimmed = summary.trim();
    return trimmed || null;
  }

  if (typeof summary === "object" && summary !== null) {
    const description =
      typeof summary.description === "string" && summary.description.trim()
        ? summary.description.trim()
        : undefined;
    const amountValue =
      typeof summary.amount === "number"
        ? formatCurrency(summary.amount)
        : typeof summary.amount === "string" && summary.amount.trim()
        ? summary.amount.trim()
        : undefined;

    if (description || amountValue) {
      const descriptionPart = description ? `: ${description}` : "";
      const amountPart = amountValue ? ` — ${amountValue}` : "";
      return `Registrado${descriptionPart}${amountPart}`;
    }

    const entries = Object.entries(summary)
      .map(([key, value]) => {
        if (typeof value === "string" && value.trim()) {
          return `${key}: ${value.trim()}`;
        }
        if (typeof value === "number" || typeof value === "boolean") {
          return `${key}: ${value}`;
        }
        return null;
      })
      .filter((entry): entry is string => Boolean(entry));

    if (entries.length) {
      return entries.join(" · ");
    }
  }

  return null;
};

const readConversationId = () => {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(STORAGE_KEY) ?? undefined;
};

const persistConversationId = (id: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
};

const resolveMonth = () => {
  if (typeof window === "undefined") return undefined;
  const stored = window.localStorage.getItem("selectedMonth");
  if (stored) return stored;
  return getCurrentMonthInTimeZone("America/Bahia");
};

  const handleActions = (actions: AssistantAction[] | undefined) => {
    if (!actions?.length) return;
    const hasExpenseAction = actions.some((item) =>
      item.type.startsWith("expense_"),
    );
    if (hasExpenseAction) {
      notifyEntriesChanged();
    }
  };

  const resolveErrorMessageFromPayload = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return null;
    const data = payload as { message?: unknown; error?: unknown };
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
    return null;
  };

export const useAssistantChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    readConversationId(),
  );
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");

  const sendMessage = useCallback(
    async (message: string, options?: SendOptions) => {
      const trimmed = message.trim();
      if (!trimmed) return;

      setLastUserMessage(trimmed);
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        author: "user",
        text: trimmed,
      };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const month = resolveMonth();
        const payload = await chatWithAssistant({
          message: trimmed,
          conversationId,
          month,
        });

        setConversationId(payload.conversationId);
        persistConversationId(payload.conversationId);
        handleActions(payload.actions);
        options?.onActions?.(payload.actions);

        const assistantText =
          normalizeAssistantText(payload.assistantMessage) ??
          ASSISTANT_FALLBACK_MESSAGE;
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          author: "assistant",
          text: assistantText,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const summaryItems = (payload.actions ?? [])
          .map(formatActionSummary)
          .filter((item): item is string => Boolean(item));
        if (summaryItems.length) {
          const summaryMessage: ChatMessage = {
            id: `summary-${Date.now()}`,
            author: "summary",
            text: summaryItems.join("   "),
          };
          setMessages((prev) => [...prev, summaryMessage]);
        }

        setSuggestions(payload.suggestions ?? defaultSuggestions);
      } catch (err) {
        const apiError = err as Error & { payload?: unknown };
        const serverMessage =
          resolveErrorMessageFromPayload(apiError.payload) ??
          (err instanceof Error ? err.message : null);
        const friendly =
          serverMessage ||
          "NÃ£o consegui falar com o servidor agora. Tente novamente.";
        setError(friendly);
        const assistantMessage: ChatMessage = {
          id: `assistant-error-${Date.now()}`,
          author: "assistant",
          text: friendly,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setLoading(false);
      }
    },
    [conversationId],
  );

  const resetConversation = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    setConversationId(undefined);
    setMessages([]);
    setSuggestions(defaultSuggestions);
  }, []);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  return {
    messages,
    loading,
    error,
    suggestions,
    sendMessage,
    conversationId,
    lastUserMessage,
    resetConversation,
    hasMessages,
  };
};
