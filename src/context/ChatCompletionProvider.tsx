import { useAuth } from "@/context/AuthProvider";
import {
  Conversation,
  History,
  clearHistory,
  deleteConversationFromHistory,
  getHistory,
  storeConversation,
  updateConversation,
} from "@/utils/History";
import {
  OpenAIChatMessage as ChatMessage,
  OpenAIChatModels,
  OpenAIConfig,
  OpenAISystemMessage,
  defaultConfig,
} from "@/utils/OpenAI";
import { SCRIPT_DEFAULT_ID, Script, getScript } from "@/utils/Scripts";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useCallback, useEffect } from "react";

const CHAT_ROUTE = "/";

const defaultContext = {
  systemMessage: {
    role: "system",
    content: "You are a helpful AI chatbot.",
  } as OpenAISystemMessage,
  messages: [] as ChatMessage[],
  config: defaultConfig as OpenAIConfig,
  updateSystemMessage: (content: string) => {},
  addMessage: () => {},
  removeMessage: (id: number) => {},
  conversationName: "",
  conversationId: "",
  deleteConversation: () => {},
  updateConversationName: () => {},
  conversations: {} as History,
  clearConversations: () => {},
  clearConversation: () => {},
  loadConversation: (id: string, conversation: Conversation) => {},
  toggleMessageRole: (id: number) => {},
  updateMessageContent: (id: number, content: string) => {},
  updateConfig: (newConfig: Partial<OpenAIConfig>) => {},
  submit: () => {},
  loading: true,
  error: "",
};

const ChatCompletionProvider = React.createContext<{
  systemMessage: OpenAISystemMessage;
  messages: ChatMessage[];
  config: OpenAIConfig;
  updateSystemMessage: (content: string) => void;
  addMessage: (
    content?: string,
    submit?: boolean,
    role?: "user" | "assistant"
  ) => void;
  removeMessage: (id: number) => void;
  conversationName: string;
  conversationId: string;
  deleteConversation: (id: string) => void;
  updateConversationName: (id: string, name: string) => void;
  conversations: History;
  clearConversation: () => void;
  clearConversations: () => void;
  loadConversation: (id: string, conversation: Conversation) => void;
  toggleMessageRole: (id: number) => void;
  updateMessageContent: (id: number, content: string) => void;
  updateConfig: (newConfig: Partial<OpenAIConfig>) => void;
  submit: () => void;
  loading: boolean;
  error: string;
}>(defaultContext);

export default function MessageCompletionProvider({
  children,
}: PropsWithChildren) {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [script, setScript] = React.useState<Script>();
  const [currentScriptPosition, setCurrentScriptPosition] = React.useState(0);

  // Conversation state
  const [conversations, setConversations] = React.useState<History>(
    {} as History
  );
  const [conversationId, setConversationId] = React.useState<string>("");
  const [conversationName, setConversationName] = React.useState("");
  const [systemMessage, setSystemMessage] = React.useState<OpenAISystemMessage>(
    defaultContext.systemMessage
  );
  const [config, setConfig] = React.useState<OpenAIConfig>(defaultConfig);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // Load conversation from local storage
  useEffect(() => {
    setConversations(getHistory());
    const script = getScript(SCRIPT_DEFAULT_ID);
    setScript(script);
  }, []);

  const updateSystemMessage = (content: string) => {
    setSystemMessage({
      role: "system",
      content,
    });
  };

  const removeMessage = (id: number) => {
    setMessages((prev) => {
      return [...prev.filter((message) => message.id !== id)];
    });
  };

  const toggleMessageRole = (id: number) => {
    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === id);
      if (index === -1) return prev;
      const message = prev[index];
      return [
        ...prev.slice(0, index),
        {
          ...message,
          role: message.role === "user" ? "assistant" : "user",
        },
        ...prev.slice(index + 1),
      ];
    });
  };

  const updateConfig = (newConfig: Partial<OpenAIConfig>) => {
    setConfig((prev) => {
      // If model changes set max tokens to half of the model's max tokens
      if (newConfig.model && newConfig.model !== prev.model) {
        newConfig.max_tokens = Math.floor(
          OpenAIChatModels[newConfig.model].maxLimit / 2
        );
      }

      return {
        ...prev,
        ...newConfig,
      };
    });
  };

  const updateMessageContent = (id: number, content: string) => {
    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === id);
      if (index === -1) return prev;
      const message = prev[index];
      return [
        ...prev.slice(0, index),
        {
          ...message,
          content,
        },
        ...prev.slice(index + 1),
      ];
    });
  };

  const handleStoreConversation = useCallback(() => {
    if (messages.length === 0) return;

    const conversation = {
      name: conversationName,
      systemMessage,
      messages,
      config,
      lastMessage: Date.now(),
    } as Conversation;

    let id = storeConversation(conversationId, conversation);
    setConversationId(id);
    setConversations((prev) => ({ ...prev, [id]: conversation }));

    if (router.pathname === CHAT_ROUTE) router.push(`/chat/${id}`);
  }, [conversationId, messages]);

  useEffect(() => {
    handleStoreConversation();
  }, [messages, systemMessage, config]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      return;
    }
    submitMessages(messages);
  }, [messages]);

  const loadConversation = (id: string, conversation: Conversation) => {
    setConversationId(id);

    const { systemMessage, messages, config, name } = conversation;

    setSystemMessage(systemMessage);
    setMessages(messages);
    updateConfig(config);
    setConversationName(name);
  };

  const clearConversations = useCallback(() => {
    clearHistory();

    setMessages([]);
    setConversationId("");
    setConversations({});

    router.push("/");
  }, []);

  const clearConversation = () => {
    setMessages([]);
    setSystemMessage(defaultContext.systemMessage);
    setConversationId("");
  };

  const deleteConversation = (id: string) => {
    deleteConversationFromHistory(id);
    setConversations((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });

    if (id === conversationId) clearConversation();
  };

  const updateConversationName = (id: string, name: string) => {
    setConversations((prev) => {
      const conversation = prev[id];
      if (!conversation) return prev;
      return {
        ...prev,
        [id]: {
          ...conversation,
          name,
        },
      };
    });

    if (id === conversationId) setConversationName(name);

    updateConversation(id, { name });
  };

  const submitMessages = useCallback(
    async (messages_: ChatMessage[] = []) => {
      if (loading) {
        return;
      }
      setLoading(true);

      messages_ = messages_.length ? messages_ : messages;

      if (!tryFetchCompletionFromScript(messages_)) {
        fetchCompletion(messages_);
      }

      setLoading(false);
    },
    [config, messages, systemMessage, loading, token]
  );

  const tryFetchCompletionFromScript = (messages_: ChatMessage[]) => {
    const lastUserMessage = messages_
      .filter((message) => message.role === "user")
      .pop();

    if (lastUserMessage?.content?.charAt(0) !== " ") {
      return false;
    }

    const scriptItem = script?.scriptItems[currentScriptPosition];
    if (!scriptItem) {
      return false;
    }

    setMessages((prev) => {
      return [
        ...prev,
        {
          id: prev.length,
          role: "assistant",
          content: scriptItem.value,
        },
      ];
    });

    setCurrentScriptPosition((x) => x + 1);

    return true;
  };

  const fetchCompletion = async (messages_: ChatMessage[]) => {
    console.log("fetchCompletion from API");
    // return;
    try {
      const decoder = new TextDecoder();
      const { body, ok } = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...config,
          messages: [systemMessage, ...messages_].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!body) return;
      const reader = body!.getReader();

      if (!ok) {
        // Get the error message from the response body
        const { value } = await reader.read();
        const chunkValue = decoder.decode(value);
        const { error } = JSON.parse(chunkValue);

        throw new Error(
          error?.message ||
            "Failed to fetch response, check your API key and try again."
        );
      }

      let done = false;

      const message: ChatMessage = {
        id: messages_.length,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => {
        message.id = prev.length;
        return [...prev, message];
      });

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        message.content += chunkValue;

        updateMessageContent(message.id as number, message.content);
      }
    } catch (error: any) {
      console.warn("Error while fetching", error);
    }
  };

  const addMessage = useCallback(
    (
      content: string = "",
      isSubmitting: boolean = false,
      role: "user" | "assistant" = "user"
    ) => {
      setMessages((prev) => {
        const messages = [
          ...prev,
          {
            id: prev.length,
            role,
            content: content || "",
          } as ChatMessage,
        ];
        return messages;
      });
    },
    [submitMessages]
  );

  const value = React.useMemo(
    () => ({
      systemMessage,
      messages,
      config,
      loading,
      updateSystemMessage,
      addMessage,
      removeMessage,
      conversationId,
      conversationName,
      updateConversationName,
      deleteConversation,
      loadConversation,
      clearConversation,
      conversations,
      clearConversations,
      toggleMessageRole,
      updateMessageContent,
      updateConfig,
      submit: submitMessages,
      error,
    }),
    [
      systemMessage,
      messages,
      config,
      loading,
      addMessage,
      submitMessages,
      conversationId,
      conversations,
      clearConversations,
      error,
    ]
  );

  return (
    <ChatCompletionProvider.Provider value={value}>
      {children}
    </ChatCompletionProvider.Provider>
  );
}

export const useOpenAI = () => React.useContext(ChatCompletionProvider);
