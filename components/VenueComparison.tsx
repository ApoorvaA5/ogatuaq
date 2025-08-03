'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrderbookData } from '@/hooks/useOrderbookData';
import { GitCompare, TrendingUp, TrendingDown } from 'lucide-react';

interface VenueComparisonProps {
  symbol: string;
}

export function VenueComparison({ symbol }: VenueComparisonProps) {
  const okxData = useOrderbookData('okx', symbol);
  const bybitData = useOrderbookData('bybit', symbol);
  const deribitData = useOrderbookData('deribit', symbol);

  const venues = [
    { name: 'OKX', data: okxData, color: 'bg-blue-500' },
    { name: 'Bybit', data: bybitData, color: 'bg-yellow-500' },
    { name: 'Deribit', data: deribitData, color: 'bg-purple-500' }
  ];

  const getBestPrices = () => {
    const prices = venues.map(venue => ({
      name: venue.name,
      bestBid: venue.data.orderbook?.bids?.[0]?.price || 0,
      bestAsk: venue.data.orderbook?.asks?.[0]?.price || 0,
      spread: venue.data.orderbook?.spread || 0,
      connected: venue.data.isConnected
    }));

    const bestBidVenue = prices.reduce((prev, current) => 
      current.bestBid > prev.bestBid ? current : prev
    );
    const bestAskVenue = prices.reduce((prev, current) => 
      current.bestAsk < prev.bestAsk && current.bestAsk > 0 ? current : prev
    );

    return { prices, bestBidVenue, bestAskVenue };
  };

  const { prices, bestBidVenue, bestAskVenue } = getBestPrices();

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitCompare className="h-5 w-5" />
            <span>Venue Comparison - {symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Venue</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Best Bid</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Best Ask</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Spread</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((venue) => (
                  <tr key={venue.name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${venue.connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="font-medium">{venue.name}</span>
                        {venue.name === bestBidVenue.name && (
                          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Best Bid
                          </Badge>
                        )}
                        {venue.name === bestAskVenue.name && (
                          <Badge variant="outline" className="text-red-400 border-red-400">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Best Ask
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-mono text-emerald-400">
                      {venue.bestBid > 0 ? `$${venue.bestBid.toFixed(2)}` : '---'}
                    </td>
                    <td className="text-right py-3 px-2 font-mono text-red-400">
                      {venue.bestAsk > 0 ? `$${venue.bestAsk.toFixed(2)}` : '---'}
                    </td>
                    <td className="text-right py-3 px-2 font-mono">
                      {venue.spread > 0 ? `$${venue.spread.toFixed(2)}` : '---'}
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={venue.connected ? "default" : "destructive"}>
                        {venue.connected ? "Live" : "Offline"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Arbitrage Opportunities */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Arbitrage Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prices.some(p => p.bestBid > 0 && p.bestAsk > 0) ? (
              <div className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-emerald-400">
                      Buy {bestAskVenue.name} → Sell {bestBidVenue.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Profit margin opportunity detected
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-emerald-400">
                      +{((bestBidVenue.bestBid - bestAskVenue.bestAsk) / bestAskVenue.bestAsk * 100).toFixed(3)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      ${(bestBidVenue.bestBid - bestAskVenue.bestAsk).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-4">
                No arbitrage opportunities detected
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}