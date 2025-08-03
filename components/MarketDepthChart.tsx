'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useOrderbookData } from '@/hooks/useOrderbookData';
import { TrendingUp } from 'lucide-react';

interface MarketDepthChartProps {
  venue: 'okx' | 'bybit' | 'deribit';
  symbol: string;
}

export function MarketDepthChart({ venue, symbol }: MarketDepthChartProps) {
  const { orderbook } = useOrderbookData(venue, symbol);

  // Transform orderbook data for depth chart
  const getDepthData = () => {
    if (!orderbook) return [];

    const bidsData = orderbook.bids.map((bid, index) => ({
      price: bid.price,
      bidVolume: bid.total,
      askVolume: 0,
      side: 'bid'
    }));

    const asksData = orderbook.asks.map((ask, index) => ({
      price: ask.price,
      bidVolume: 0,
      askVolume: ask.total,
      side: 'ask'
    }));

    return [...bidsData.reverse(), ...asksData].sort((a, b) => a.price - b.price);
  };

  const depthData = getDepthData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-mono text-gray-300">{`Price: $${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm font-mono ${entry.dataKey === 'bidVolume' ? 'text-emerald-400' : 'text-red-400'}`}>
              {entry.dataKey === 'bidVolume' ? 'Bid' : 'Ask'} Volume: {entry.value.toFixed(4)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Market Depth - {venue.toUpperCase()} {symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={depthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="price" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="stepAfter"
                dataKey="bidVolume"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
              <Area
                type="stepBefore"
                dataKey="askVolume"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Depth Statistics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-400">Bid Depth (5%)</div>
            <div className="font-mono text-emerald-400">
              {orderbook?.bids ? orderbook.bids.slice(0, 10).reduce((sum, bid) => sum + bid.total, 0).toFixed(2) : '---'}
            </div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-400">Ask Depth (5%)</div>
            <div className="font-mono text-red-400">
              {orderbook?.asks ? orderbook.asks.slice(0, 10).reduce((sum, ask) => sum + ask.total, 0).toFixed(2) : '---'}
            </div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-400">Imbalance</div>
            <div className="font-mono text-yellow-400">
              {orderbook ? ((orderbook.bids[0]?.total - orderbook.asks[0]?.total) / (orderbook.bids[0]?.total + orderbook.asks[0]?.total) * 100).toFixed(1) : '---'}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}