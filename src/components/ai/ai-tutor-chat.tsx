'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  Send,
  X,
  Minus,
  Maximize2,
  Sparkles,
  User,
  Loader2,
  BookOpen,
  HelpCircle,
  Code,
  GraduationCap,
  MessageSquare,
  ChevronLeft,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';
import { useAppStore } from '@/store/app-store';
import { useCourses } from '@/hooks/use-data';

// ============================================================
// Markdown Renderer (simplified - handles code, bold, lists)
// ============================================================
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-2 rounded-lg bg-slate-900 p-3 text-sm text-emerald-300 overflow-x-auto font-mono"
          >
            {codeLang && (
              <div className="text-xs text-slate-500 mb-1">{codeLang}</div>
            )}
            <code>{codeContent.trim()}</code>
          </pre>
        );
        codeContent = '';
        codeLang = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Inline formatting
    const formatInline = (text: string): React.ReactNode => {
      // Bold
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={idx} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Inline code
        const codeParts = part.split(/(`[^`]+`)/g);
        return codeParts.map((cp, cidx) => {
          if (cp.startsWith('`') && cp.endsWith('`')) {
            return (
              <code
                key={`${idx}-${cidx}`}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-violet-700 dark:bg-slate-800 dark:text-violet-300"
              >
                {cp.slice(1, -1)}
              </code>
            );
          }
          return cp;
        });
      });
    };

    // Headers
    if (line.startsWith('### ')) {
      if (inList) { inList = false; }
      elements.push(
        <h4 key={`h3-${i}`} className="font-semibold text-foreground mt-3 mb-1">
          {formatInline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { inList = false; }
      elements.push(
        <h3 key={`h2-${i}`} className="text-base font-semibold text-foreground mt-3 mb-1">
          {formatInline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { inList = false; }
      elements.push(
        <h2 key={`h1-${i}`} className="text-lg font-bold text-foreground mt-3 mb-1">
          {formatInline(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      inList = true;
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-sm text-muted-foreground">
          {formatInline(line.replace(/^[-*]\s/, ''))}
        </li>
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      inList = true;
      elements.push(
        <li key={`oli-${i}`} className="ml-4 list-decimal text-sm text-muted-foreground">
          {formatInline(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
      continue;
    }

    if (inList) { inList = false; }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    // Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm text-muted-foreground leading-relaxed">
        {formatInline(line)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// ============================================================
// Floating Chat Widget
// ============================================================
interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  courseContext?: string;
}

export function AITutorFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your AI Learning Assistant. I can help you understand concepts, debug code, create study plans, and more. What would you like to learn today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const text = messageText || input.trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            sessionId: 'floating-chat',
          }),
        });

        if (!res.ok) throw new Error('Failed to get response');

        const data = await res.json();

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response || 'I apologize, but I could not generate a response. Please try again.',
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        toast.error('Failed to get AI response. Please try again.');
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again in a moment.',
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading]
  );

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-violet-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-shadow"
            aria-label="Open AI Learning Assistant"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-violet-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Learning Assistant</p>
                  <p className="text-[10px] text-white/70">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    const store = useAppStore.getState();
                    store.setView('ai-assistant');
                    setIsOpen(false);
                  }}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900 dark:to-violet-900">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900 dark:to-violet-900">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="h-2 w-2 rounded-full bg-emerald-500"
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="h-2 w-2 rounded-full bg-violet-500"
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="h-2 w-2 rounded-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-xl text-sm"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// Full-Page AI Tutor
// ============================================================
export function AITutorFullPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      title: 'Getting Started',
      messages: [
        {
          id: 'welcome-full',
          role: 'assistant',
          content:
            "Welcome to your AI Learning Assistant! I can help you with:\n\n- **Understanding concepts** — Ask me to explain any topic\n- **Code help** — Debug issues or learn new patterns\n- **Study plans** — Create personalized learning paths\n- **Quiz prep** — Review and practice for assessments\n\nWhat would you like to explore today?",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ]);
  const [activeConvId, setActiveConvId] = useState('conv-1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: coursesData } = useCourses();
  const demoCourses = coursesData || [];

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, scrollToBottom]);

  const suggestedPrompts = [
    { icon: Code, label: 'Explain Server Components', prompt: 'Explain how React Server Components work in Next.js, with practical examples and when to use them vs client components.' },
    { icon: HelpCircle, label: 'Help me with this quiz', prompt: 'I need help preparing for a quiz. Can you give me some practice questions on web development fundamentals and explain the answers?' },
    { icon: GraduationCap, label: 'Create a study plan', prompt: 'Create a 4-week study plan for learning full-stack web development, starting from the basics and progressing to advanced topics.' },
    { icon: MessageSquare, label: 'Review my code', prompt: 'I want to learn best practices for code review. Can you explain common patterns and anti-patterns in React/Next.js code?' },
  ];

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const text = messageText || input.trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConvId
            ? { ...conv, messages: [...conv.messages, userMsg], title: conv.messages.length <= 1 ? text.slice(0, 40) + (text.length > 40 ? '...' : '') : conv.title }
            : conv
        )
      );
      setInput('');
      setIsLoading(true);

      const courseContext =
        selectedCourse !== 'all'
          ? demoCourses.find((c: any) => c.id === selectedCourse)?.title
          : undefined;

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            context: courseContext,
            sessionId: activeConvId,
          }),
        });

        if (!res.ok) throw new Error('Failed to get response');

        const data = await res.json();

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response || 'I apologize, but I could not generate a response. Please try again.',
          timestamp: new Date().toISOString(),
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConvId
              ? { ...conv, messages: [...conv.messages, aiMsg] }
              : conv
          )
        );
      } catch {
        toast.error('Failed to get AI response. Please try again.');
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConvId
              ? {
                  ...conv,
                  messages: [
                    ...conv.messages,
                    {
                      id: `error-${Date.now()}`,
                      role: 'assistant',
                      content: 'Sorry, I encountered an error. Please try again in a moment.',
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : conv
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, activeConvId, selectedCourse]
  );

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Chat',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: "Hello! I'm your AI Learning Assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  const deleteConversation = (convId: string) => {
    if (conversations.length <= 1) {
      toast.error("Can't delete the last conversation");
      return;
    }
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(conversations.find((c) => c.id !== convId)?.id || '');
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Conversation History */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-border bg-card/50 flex flex-col shrink-0 overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-600">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">AI Tutor</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button
                onClick={createNewConversation}
                className="w-full justify-start gap-2 text-sm"
                variant="outline"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                New Chat
              </Button>
            </div>

            {/* Course Context Selector */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Course Focus
              </p>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Courses</option>
                {demoCourses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                    conv.id === activeConvId
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate flex-1 text-xs">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="h-3 w-3 text-red-400 hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3 bg-card/50">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarOpen(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h2 className="text-sm font-semibold text-foreground">AI Learning Assistant</h2>
              <p className="text-xs text-muted-foreground">
                {selectedCourse !== 'all'
                  ? `Focused on: ${demoCourses.find((c: any) => c.id === selectedCourse)?.title}`
                  : 'General learning mode'}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs gap-1">
            <Sparkles className="h-3 w-3" />
            Powered by AI
          </Badge>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          {activeConv && activeConv.messages.length <= 1 && (
            /* Suggested Prompts */
            <div className="mb-8">
              <p className="text-sm font-medium text-muted-foreground mb-4 text-center">
                Try one of these to get started
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedPrompts.map((prompt) => (
                  <Card
                    key={prompt.label}
                    className="p-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
                    onClick={() => sendMessage(prompt.prompt)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                        <prompt.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{prompt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {prompt.prompt.slice(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Message List */}
          <div className="space-y-6 max-w-3xl mx-auto">
            {activeConv?.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900 dark:to-violet-900 mt-0.5">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground/60'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900 dark:to-violet-900">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex gap-2">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="h-2.5 w-2.5 rounded-full bg-violet-500"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border px-6 py-4 bg-card/50">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-3 items-end"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask anything about your courses..."
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] max-h-[120px]"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 shrink-0"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
