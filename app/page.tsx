'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderbookViewer } from '@/components/OrderbookViewer';
import { OrderSimulationForm } from '@/components/OrderSimulationForm';
import { MarketDepthChart } from '@/components/MarketDepthChart';
import { VenueComparison } from '@/components/VenueComparison';
import { TrendingUp, BarChart3, Calculator, GitCompare } from 'lucide-react';

export default function Home() {
  const [selectedVenue, setSelectedVenue] = useState<'okx' | 'bybit' | 'deribit'>('okx');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USD');
  const [simulatedOrder, setSimulatedOrder] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                OrderFlow Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Real-time orderbook analysis
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="orderbook" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
            <TabsTrigger value="orderbook" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Orderbook</span>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Simulation</span>
            </TabsTrigger>
            <TabsTrigger value="depth" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Market Depth</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center space-x-2">
              <GitCompare className="h-4 w-4" />
              <span>Comparison</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orderbook">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OrderbookViewer
                  venue={selectedVenue}
                  symbol={selectedSymbol}
                  simulatedOrder={simulatedOrder}
                  onVenueChange={setSelectedVenue}
                  onSymbolChange={setSelectedSymbol}
                />
              </div>
              <div>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Market Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Spread:</span>
                        <span className="text-emerald-400 font-mono">0.05%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume 24h:</span>
                        <span className="font-mono">$2.4B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Imbalance:</span>
                        <span className="text-red-400 font-mono">-2.3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulation">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OrderSimulationForm
                selectedVenue={selectedVenue}
                selectedSymbol={selectedSymbol}
                onSimulatedOrderChange={setSimulatedOrder}
              />
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Simulation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {simulatedOrder ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800 rounded-lg">
                        <h4 className="font-semibold text-emerald-400 mb-2">Order Impact Analysis</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Fill Percentage:</span>
                            <div className="font-mono text-emerald-400">94.2%</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Slippage:</span>
                            <div className="font-mono text-yellow-400">0.12%</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Market Impact:</span>
                            <div className="font-mono text-red-400">$245</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Est. Fill Time:</span>
                            <div className="font-mono">~2.3s</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      Configure and submit an order simulation to see results
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="depth">
            <MarketDepthChart
              venue={selectedVenue}
              symbol={selectedSymbol}
              simulatedOrder={simulatedOrder}
            />
          </TabsContent>

          <TabsContent value="comparison">
            <VenueComparison symbol={selectedSymbol} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}