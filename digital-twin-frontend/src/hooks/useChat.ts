import { useState, useCallback, useRef, useEffect } from 'react';

const TYPING_DELAY_MS = 2000;

export function useChat() {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTypingIndicator = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate assistant response delay
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      timeoutRef.current = null;
      // Here you would typically add the assistant's response to messages
    }, TYPING_DELAY_MS);
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    console.log('Quick action:', action);
    showTypingIndicator();
  }, [showTypingIndicator]);

  const handleSendMessage = useCallback((message: string) => {
    console.log('Message sent:', message);
    showTypingIndicator();
  }, [showTypingIndicator]);

  return {
    isTyping,
    handleQuickAction,
    handleSendMessage,
  };
}
