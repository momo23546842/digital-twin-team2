import { useState, useCallback, useRef, useEffect } from 'react';

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

  const handleQuickAction = useCallback((action: string) => {
    console.log('Quick action:', action);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Simulate typing indicator when processing quick action
    setIsTyping(true);
    
    // Simulate assistant response delay
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      timeoutRef.current = null;
      // Here you would typically add the assistant's response to messages
    }, 2000);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    console.log('Message sent:', message);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Show typing indicator when message is sent
    setIsTyping(true);
    
    // Simulate assistant response delay
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      timeoutRef.current = null;
      // Here you would typically add the assistant's response to messages
    }, 2000);
  }, []);

  return {
    isTyping,
    handleQuickAction,
    handleSendMessage,
  };
}
