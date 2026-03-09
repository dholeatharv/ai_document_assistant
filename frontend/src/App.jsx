import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Upload,
  Send,
  FileText,
  Sparkles,
  ShieldCheck,
  Search,
  Brain,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link2,
  MessageSquare,
  Bot,
  User,
  FolderOpen,
  Zap,
  ChevronRight,
  Database,
  PanelLeft,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8002";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [askError, setAskError] = useState("");
  const [streamingAnswer, setStreamingAnswer] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Upload documents and ask questions. Answers are generated from retrieved document context.",
      sources: [],
      retrieved_results: [],
    },
  ]);

  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch(`${API_BASE}/documents`);
        if (!response.ok) {
          throw new Error("Failed to load documents");
        }

        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error(err);
      } finally {
        setDocumentsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const stats = useMemo(() => {
    const questions = messages.filter((m) => m.role === "user").length;
    return {
      docs: documents.length,
      questions,
    };
  }, [documents, messages]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError("");
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Upload failed");
      }

      const data = await response.json();
      setUploadMessage(data.message || "File uploaded successfully.");

      setDocuments((prev) => {
        const exists = prev.some((doc) => doc.name === selectedFile.name);
        if (exists) return prev;

        return [
          {
            name: selectedFile.name,
            type: selectedFile.name.toLowerCase().endsWith(".pdf")
              ? "PDF"
              : "TXT",
            status: "Indexed",
            chunks: data.chunks_added ?? "-",
          },
          ...prev,
        ];
      });

      setSelectedFile(null);
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    if (documents.length === 0) {
      setAskError("Upload at least one document before asking a question.");
      return;
    }

    const userMessage = question.trim();

    setAskError("");
    setLoading(true);
    setQuestion("");
    setStreamingAnswer("");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    scrollToBottom();

    try {
      const streamResponse = await fetch(`${API_BASE}/ask-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!streamResponse.ok) {
        let errMessage = "Streaming failed";
        try {
          const errData = await streamResponse.json();
          errMessage = errData.detail || errMessage;
        } catch {
          const errText = await streamResponse.text();
          errMessage = errText || errMessage;
        }
        throw new Error(errMessage);
      }

      if (!streamResponse.body) {
        throw new Error("Streaming response body is missing");
      }

      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let finalText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        finalText += chunk;
        setStreamingAnswer(finalText);
        scrollToBottom();
      }

      const fullResponse = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!fullResponse.ok) {
        const errData = await fullResponse.json();
        throw new Error(errData.detail || "Failed to fetch final metadata");
      }

      const data = await fullResponse.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: finalText || data.answer,
          sources: data.sources || [],
          retrieved_results: data.retrieved_results || [],
        },
      ]);

      setStreamingAnswer("");
      scrollToBottom();
    } catch (err) {
      setAskError(err.message || "Unable to generate answer.");
      setStreamingAnswer("");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn’t generate an answer for that request.",
          sources: [],
          retrieved_results: [],
          isError: true,
        },
      ]);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_24%),linear-gradient(to_bottom,rgba(15,23,42,1),rgba(2,6,23,1))]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                <Sparkles className="h-4 w-4" />
                AI Knowledge Workspace
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Knowledge Retrieval Assistant
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Ask questions over indexed documents and inspect grounded
                  evidence behind each answer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={FolderOpen}
                label="Documents"
                value={String(stats.docs)}
              />
              <StatCard
                icon={MessageSquare}
                label="Questions"
                value={String(stats.questions)}
              />
              <StatCard icon={Zap} label="RAG" value="Active" />
              <StatCard icon={ShieldCheck} label="Mode" value="Grounded" />
            </div>
          </div>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Panel>
              <PanelTitle icon={Upload} title="Document Intake" />
              <p className="mt-2 text-sm text-slate-300">
                Upload TXT or PDF files and add them to the searchable
                workspace.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-600 bg-slate-900/70 px-4 py-5 text-sm text-slate-300 transition hover:border-cyan-400/50 hover:bg-slate-900"
              >
                <Upload className="h-4 w-4" />
                {selectedFile ? selectedFile.name : "Choose a file"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".txt,.pdf"
              />

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload and index"}
              </button>

              {uploadMessage && (
                <MessageBanner
                  type="success"
                  icon={CheckCircle2}
                  text={uploadMessage}
                />
              )}
              {uploadError && (
                <MessageBanner
                  type="error"
                  icon={AlertCircle}
                  text={uploadError}
                />
              )}
            </Panel>

            <Panel>
              <PanelTitle icon={PanelLeft} title="Indexed Documents" />
              <div className="mt-4 space-y-3">
                {documentsLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
                    Loading indexed documents...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
                    No documents indexed yet.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="rounded-2xl border border-white/10 bg-slate-900/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-100">
                            {doc.name}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                            <span className="rounded-full border border-white/10 px-2 py-1">
                              {doc.type}
                            </span>
                            <span className="rounded-full border border-white/10 px-2 py-1">
                              {doc.status}
                            </span>
                            <span className="rounded-full border border-white/10 px-2 py-1">
                              {doc.chunks} chunks
                            </span>
                          </div>
                        </div>
                        <Database className="h-4 w-4 shrink-0 text-cyan-300" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel>
              <PanelTitle icon={Brain} title="System Status" />
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <FeatureRow
                  title="Embedding model"
                  text="text-embedding-3-small"
                />
                <FeatureRow title="Vector database" text="FAISS local index" />
                <FeatureRow
                  title="Retrieval pipeline"
                  text="Semantic search + context ranking"
                />
                <FeatureRow
                  title="Answer generation"
                  text="LLM grounded on retrieved chunks"
                />
              </div>
            </Panel>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl"
          >
            <div className="border-b border-white/10 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Conversation</h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Ask grounded questions and inspect where the answer came
                    from.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Retrieval-backed answers
                </div>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="h-[520px] space-y-5 overflow-y-auto p-5"
            >
              {messages.map((message, idx) => (
                <ChatMessage key={idx} message={message} />
              ))}

              {streamingAnswer && (
                <ChatMessage
                  message={{
                    role: "assistant",
                    content: streamingAnswer,
                    sources: [],
                    retrieved_results: [],
                  }}
                />
              )}

              {loading && !streamingAnswer && (
                <div className="flex gap-3">
                  <Avatar type="assistant" />
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Retrieving context...
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-3 shadow-inner">
                <textarea
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask a question about the indexed documents..."
                  className="w-full resize-none bg-transparent px-2 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-400">
                    Press Enter to send · Shift + Enter for a new line
                  </div>
                  <div className="flex items-center gap-2">
                    {askError && (
                      <span className="text-xs text-rose-300">{askError}</span>
                    )}
                    <button
                      onClick={askQuestion}
                      disabled={loading || documents.length === 0}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {loading ? "Thinking..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
      {children}
    </div>
  );
}

function PanelTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-2">
        <Icon className="h-4 w-4 text-cyan-300" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function FeatureRow({ title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-3">
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
      <div>
        <div className="font-medium text-slate-100">{title}</div>
        <div className="mt-1 text-xs leading-5 text-slate-400">{text}</div>
      </div>
    </div>
  );
}

function MessageBanner({ type, icon: Icon, text }) {
  const classes =
    type === "success"
      ? "mt-3 flex items-start gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200"
      : "mt-3 flex items-start gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200";

  return (
    <div className={classes}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function Avatar({ type }) {
  const assistant = type === "assistant";
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
        assistant
          ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
          : "border-white/10 bg-white/10 text-white"
      }`}
    >
      {assistant ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
    </div>
  );
}

function ChatMessage({ message }) {
  const isAssistant = message.role === "assistant";
  const showCursor =
    isAssistant &&
    !message.sources?.length &&
    !message.retrieved_results?.length &&
    !message.isError;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "justify-end"}`}>
      {isAssistant && <Avatar type="assistant" />}

      <div
        className={`max-w-3xl rounded-3xl border px-4 py-3 ${
          isAssistant
            ? message.isError
              ? "border-rose-400/20 bg-rose-400/10"
              : "border-white/10 bg-white/5"
            : "border-slate-700 bg-slate-900/80"
        }`}
      >
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          {isAssistant ? "Assistant" : "You"}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-100">
          {message.content}
          {showCursor && (
            <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-cyan-300 align-middle" />
          )}
        </p>

        {isAssistant && message.sources?.length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              <Link2 className="h-3.5 w-3.5" />
              Sources
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <span
                  key={`${source}-${idx}`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {isAssistant && message.retrieved_results?.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-900"
            >
              <Search className="h-3.5 w-3.5" />
              {expanded ? "Hide evidence" : "Show evidence"}
            </button>

            {expanded && (
              <div className="mt-3 grid gap-3">
                {message.retrieved_results.map((item) => (
                  <div
                    key={item.chunk_id ?? `${item.document_name}-${item.rank}`}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="rounded-full border border-white/10 px-2 py-1">
                        Rank {item.rank}
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-1">
                        {item.document_name}
                      </span>
                    </div>
                    <p className="text-xs leading-6 text-slate-300">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!isAssistant && <Avatar type="user" />}
    </div>
  );
}