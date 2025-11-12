
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, CornerDownLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAiAssistantResponse } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AssistantPanel() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPanelVisible, setPanelVisible] = React.useState(false);
  const { user } = useAuth();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleTogglePanel = () => {
    setPanelVisible(prev => !prev);
    if (!isPanelVisible && messages.length === 0) {
      // Add initial greeting message if panel is opened for the first time
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: "Hello! How can I help you find a resource on campus today? You can ask me something like, 'Find a quiet place to study for 2 people.'",
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAiAssistantResponse({
        query: input,
        userId: user?.id || 'guest',
        userRole: user?.role || 'student',
      });

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: "I'm sorry, but I'm having trouble connecting to my services right now. Please try again in a moment.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={handleTogglePanel} size="lg" className="rounded-full shadow-lg">
          <Bot className="mr-2" />
          AI Assistant
        </Button>
      </div>

      <AnimatePresence>
        {isPanelVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-40"
          >
            <Card className="w-[380px] h-[550px] flex flex-col shadow-2xl">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Bot /> AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col p-0">
                <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.role === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="w-8 h-8 border-2 border-primary">
                            <AvatarFallback>
                              <Bot className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                       <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 border-2 border-primary">
                                <AvatarFallback>
                                <Bot className="w-5 h-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg px-3 py-2 bg-muted">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t bg-background">
                  <form onSubmit={handleSubmit} className="relative">
                    <Textarea
                      placeholder="Ask me to find a resource..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pr-20 h-12"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      disabled={isLoading || !input.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press <CornerDownLeft className="inline w-3 h-3" /> to send. Shift + <CornerDownLeft className="inline w-3 h-3" /> for a new line.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
