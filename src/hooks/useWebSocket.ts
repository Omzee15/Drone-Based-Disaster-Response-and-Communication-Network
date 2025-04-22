
import { useState, useEffect, useCallback } from 'react';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  // Simulate WebSocket connection
  useEffect(() => {
    // Simulate connection delay
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = useCallback((message: any) => {
    console.log('Sending WebSocket message:', message);
    // In a real implementation, this would send data to the backend
  }, []);

  return {
    isConnected,
    sendMessage,
  };
};
