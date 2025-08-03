'use client';

import { useState, useEffect, useRef } from 'react';

export interface OrderbookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderbookData {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  spread: number;
  timestamp: number;
}

export function useOrderbookData(venue: 'okx' | 'bybit' | 'deribit', symbol: string) {
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate mock orderbook data that simulates real market conditions
  const generateMockOrderbook = (): OrderbookData => {
    const basePrice = 65000; // BTC base price
    const spread = Math.random() * 20 + 5; // 5-25 USD spread
    
    const bids: OrderbookLevel[] = [];
    const asks: OrderbookLevel[] = [];
    
    let bidTotal = 0;
    let askTotal = 0;
    
    // Generate bids (below mid price)
    for (let i = 0; i < 15; i++) {
      const price = basePrice - spread/2 - (i * Math.random() * 10 + 5);
      const size = Math.random() * 3 + 0.1;
      bidTotal += size;
      bids.push({ price, size, total: bidTotal });
    }
    
    // Generate asks (above mid price)
    for (let i = 0; i < 15; i++) {
      const price = basePrice + spread/2 + (i * Math.random() * 10 + 5);
      const size = Math.random() * 3 + 0.1;
      askTotal += size;
      asks.push({ price, size, total: askTotal });
    }

    return {
      bids: bids.sort((a, b) => b.price - a.price),
      asks: asks.sort((a, b) => a.price - b.price),
      spread,
      timestamp: Date.now()
    };
  };

  // Simulate WebSocket connection with mock data
  useEffect(() => {
    const connectWebSocket = () => {
      // Simulate connection
      setIsConnected(true);
      setOrderbook(generateMockOrderbook());
      setLastUpdate(Date.now());

      // Update orderbook every 500ms to simulate real-time updates
      intervalRef.current = setInterval(() => {
        setOrderbook(generateMockOrderbook());
        setLastUpdate(Date.now());
      }, 500 + Math.random() * 1000); // Random interval 500-1500ms
    };

    const disconnectWebSocket = () => {
      setIsConnected(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Simulate connection after a short delay
    const connectTimeout = setTimeout(connectWebSocket, 1000);

    // Cleanup
    return () => {
      clearTimeout(connectTimeout);
      disconnectWebSocket();
    };
  }, [venue, symbol]);

  // Simulate occasional disconnections for realism
  useEffect(() => {
    const disconnectInterval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance of temporary disconnect
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 2000);
      }
    }, 10000);

    return () => clearInterval(disconnectInterval);
  }, []);

  return {
    orderbook,
    isConnected,
    lastUpdate
  };
}