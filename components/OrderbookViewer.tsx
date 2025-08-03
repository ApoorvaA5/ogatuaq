'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useOrderbookData } from '@/hooks/useOrderbookData';
import { cn } from '@/lib/utils';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface OrderbookViewerProps {
  venue: 'okx' | 'bybit' | 'deribit';
  symbol: string;
  simulatedOrder?: any;
  onVenueChange: (venue: 'okx' | 'bybit' | 'deribit') => void;
  onSymbolChange: (symbol: string) => void;
}

export function OrderbookViewer({
  venue,
  symbol,
  simulatedOrder,
  onVenueChange,
  onSymbolChange
}: OrderbookViewerProps) {
  const { orderbook, isConnected, lastUpdate } = useOrderbookData(venue, symbol);

  const symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD'];
  const venues = [
    { value: 'okx', label: 'OKX' },
    { value: 'bybit', label: 'Bybit' },
    { value: 'deribit', label: 'Deribit' }
  ];

  const getOrderbookRow = (price: number, size: number, total: number, side: 'bid' | 'ask', isSimulated = false) => (
    <div
      key={`${side}-${price}`}
      className={cn(
        "grid grid-cols-3 py-1 px-2 text-sm relative overflow-hidden",
        isSimulated && "ring-2 ring-yellow-400 bg-yellow-400/10",
        side === 'bid' ? "hover:bg-emerald-500/10" : "hover:bg-red-500/10"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-20",
          side === 'bid' ? "bg-emerald-500" : "bg-red-500"
        )}
        style={{
          width: `${Math.min((total / Math.max(...(orderbook?.bids?.map(b => b.total) || [1]))) * 100, 100)}%`,
          right: side === 'bid' ? 0 : 'auto',
          left: side === 'ask' ? 0 : 'auto'
        }}
      />
      <div className={cn(
        "relative z-10 font-mono",
        side === 'bid' ? "text-emerald-400" : "text-red-400"
      )}>
        {price.toFixed(2)}
      </div>
      <div className="relative z-10 font-mono text-right">{size.toFixed(4)}</div>
      <div className="relative z-10 font-mono text-right text-gray-400">{total.toFixed(4)}</div>
    </div>
  );

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Orderbook</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-emerald-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Live" : "Disconnected"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={venue} onValueChange={onVenueChange}>
            <SelectTrigger className="w-full sm:w-32 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Venue" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {venues.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={symbol} onValueChange={onSymbolChange}>
            <SelectTrigger className="w-full sm:w-40 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Symbol" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {symbols.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-3 py-2 px-2 text-xs font-semibold text-gray-400 border-b border-gray-800">
            <div>Price</div>
            <div className="text-right">Size</div>
            <div className="text-right">Total</div>
          </div>

          {/* Asks (sells) */}
          <div className="space-y-0">
            {orderbook?.asks?.slice(0, 15).reverse().map((ask, index) =>
              getOrderbookRow(ask.price, ask.size, ask.total, 'ask')
            )}
          </div>

          {/* Spread */}
          <div className="py-3 px-2 text-center border-y border-gray-800">
            <div className="text-xs text-gray-400">Spread</div>
            <div className="font-mono text-sm text-gray-300">
              {orderbook?.spread ? `$${orderbook.spread.toFixed(2)} (${((orderbook.spread / orderbook.asks[0]?.price) * 100).toFixed(3)}%)` : '---'}
            </div>
          </div>

          {/* Bids (buys) */}
          <div className="space-y-0">
            {orderbook?.bids?.slice(0, 15).map((bid, index) =>
              getOrderbookRow(bid.price, bid.size, bid.total, 'bid')
            )}
          </div>
        </div>

        {lastUpdate && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}