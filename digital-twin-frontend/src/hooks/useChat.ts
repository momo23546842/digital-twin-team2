import { useState, useCallback } from 'react';

export function useChat() {
  const [isTyping, setIsTyping] = useState(false);

  const handleQuickAction = useCallback((action: string) => {
    console.log('Quick action:', action);
    // Simulate typing indicator when processing quick action
    setIsTyping(true);
    
    // Simulate assistant response delay
    setTimeout(() => {
      setIsTyping(false);
      // Here you would typically add the assistant's response to messages
    }, 2000);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    console.log('Message sent:', message);
    // Show typing indicator when message is sent
    setIsTyping(true);
    
    // Simulate assistant response delay
    setTimeout(() => {
      setIsTyping(false);
      // Here you would typically add the assistant's response to messages
    }, 2000);
  }, []);

  return {
    isTyping,
    handleQuickAction,
    handleSendMessage,
  };
}
