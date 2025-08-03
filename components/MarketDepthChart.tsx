'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useOrderbookData } from '@/hooks/useOrderbookData';
import { TrendingUp } from 'lucide-react';

interface MarketDepthChartProps {
  venue: 'okx' | 'bybit' | 'deribit';
  symbol: string;
  simulatedOrder?: any;
}

export function MarketDepthChart({ venue, symbol, simulatedOrder }: MarketDepthChartProps) {
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

    let combinedData = [...bidsData.reverse(), ...asksData].sort((a, b) => a.price - b.price);
    
    // Add simulated order to the chart data
    if (simulatedOrder && simulatedOrder.type === 'limit') {
      const simulatedPoint = {
        price: simulatedOrder.price,
        bidVolume: simulatedOrder.side === 'buy' ? simulatedOrder.quantity : 0,
        askVolume: simulatedOrder.side === 'sell' ? simulatedOrder.quantity : 0,
        side: simulatedOrder.side,
        isSimulated: true
      };
      
      combinedData.push(simulatedPoint);
      combinedData = combinedData.sort((a, b) => a.price - b.price);
    }
    
    return combinedData;
  };

  const depthData = getDepthData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isSimulated = payload[0]?.payload?.isSimulated;
      return (
        <div className={cn(
          "border rounded-lg p-3 shadow-lg",
          isSimulated ? "bg-yellow-900 border-yellow-600" : "bg-gray-800 border-gray-700"
        )}>
          {isSimulated && (
            <p className="text-xs text-yellow-300 font-semibold mb-1">🎯 Simulated Order</p>
          )}
          <p className="text-sm font-mono text-gray-300">{`Price: $${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={cn(
              "text-sm font-mono",
              entry.dataKey === 'bidVolume' ? 'text-emerald-400' : 'text-red-400',
              isSimulated && "font-bold"
            )}>
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
          {simulatedOrder && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Order Simulated
            </Badge>
          )}
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
              {/* Highlight simulated order points */}
              {simulatedOrder && simulatedOrder.type === 'limit' && (
                <Area
                  type="monotone"
                  dataKey={simulatedOrder.side === 'buy' ? 'bidVolume' : 'askVolume'}
                  stroke="#FCD34D"
                  fill="#FCD34D"
                  fillOpacity={0.6}
                  strokeWidth={3}
                  dot={{ fill: '#FCD34D', strokeWidth: 2, r: 6 }}
                />
              )}
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