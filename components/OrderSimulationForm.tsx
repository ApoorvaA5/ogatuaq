'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { calculateOrderImpact } from '@/lib/orderImpact';
import { AlertTriangle, Calculator, Clock } from 'lucide-react';

interface OrderSimulationFormProps {
  selectedVenue: string;
  selectedSymbol: string;
  onSimulatedOrderChange: (order: any) => void;
}

export function OrderSimulationForm({
  selectedVenue,
  selectedSymbol,
  onSimulatedOrderChange
}: OrderSimulationFormProps) {
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [timing, setTiming] = useState('immediate');
  const [isSimulating, setIsSimulating] = useState(false);
  const [impactResults, setImpactResults] = useState<any>(null);

  const timingOptions = [
    { value: 'immediate', label: 'Immediate', delay: 0 },
    { value: '5s', label: '5s Delay', delay: 5000 },
    { value: '10s', label: '10s Delay', delay: 10000 },
    { value: '30s', label: '30s Delay', delay: 30000 }
  ];

  const handleSimulation = async () => {
    if (!price || !quantity) return;

    setIsSimulating(true);

    // Simulate order impact calculation
    const mockOrderbook = {
      bids: Array.from({ length: 15 }, (_, i) => ({
        price: 65000 - (i * 10),
        size: Math.random() * 5 + 0.1,
        total: 0
      })),
      asks: Array.from({ length: 15 }, (_, i) => ({
        price: 65005 + (i * 10),
        size: Math.random() * 5 + 0.1,
        total: 0
      }))
    };

    const order = {
      venue: selectedVenue,
      symbol: selectedSymbol,
      type: orderType,
      side,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      timing
    };

    const impact = calculateOrderImpact(order, mockOrderbook);
    
    setTimeout(() => {
      setImpactResults(impact);
      onSimulatedOrderChange(order);
      setIsSimulating(false);
    }, 1000);
  };

  const isFormValid = price && quantity && parseFloat(price) > 0 && parseFloat(quantity) > 0;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Order Simulation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Venue and Symbol Display */}
        <div className="flex space-x-4">
          <div>
            <Label className="text-xs text-gray-400">Venue</Label>
            <Badge variant="outline" className="mt-1">
              {selectedVenue.toUpperCase()}
            </Badge>
          </div>
          <div>
            <Label className="text-xs text-gray-400">Symbol</Label>
            <Badge variant="outline" className="mt-1">
              {selectedSymbol}
            </Badge>
          </div>
        </div>

        {/* Order Type */}
        <div>
          <Label className="text-sm font-medium">Order Type</Label>
          <RadioGroup
            value={orderType}
            onValueChange={setOrderType}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="market" id="market" />
              <Label htmlFor="market" className="text-sm">Market</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="limit" id="limit" />
              <Label htmlFor="limit" className="text-sm">Limit</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Side */}
        <div>
          <Label className="text-sm font-medium">Side</Label>
          <RadioGroup
            value={side}
            onValueChange={setSide}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="buy" id="buy" />
              <Label htmlFor="buy" className="text-sm text-emerald-400">Buy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sell" id="sell" />
              <Label htmlFor="sell" className="text-sm text-red-400">Sell</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Price */}
        {orderType === 'limit' && (
          <div>
            <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="mt-1 bg-gray-800 border-gray-700 font-mono"
              step="0.01"
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            className="mt-1 bg-gray-800 border-gray-700 font-mono"
            step="0.0001"
          />
        </div>

        {/* Timing */}
        <div>
          <Label className="text-sm font-medium">Execution Timing</Label>
          <Select value={timing} onValueChange={setTiming}>
            <SelectTrigger className="mt-1 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {timingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Simulate Button */}
        <Button
          onClick={handleSimulation}
          disabled={!isFormValid || isSimulating}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isSimulating ? 'Simulating...' : 'Simulate Order'}
        </Button>

        {/* Impact Results */}
        {impactResults && (
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="font-semibold text-emerald-400 mb-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Impact Analysis</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Fill %:</span>
                <span className="font-mono text-emerald-400">{impactResults.fillPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slippage:</span>
                <span className="font-mono text-yellow-400">{impactResults.slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Impact:</span>
                <span className="font-mono text-red-400">${impactResults.marketImpact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. Fill Time:</span>
                <span className="font-mono">{impactResults.estimatedFillTime}s</span>
              </div>
            </div>
            
            {impactResults.warnings?.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
                <div className="text-yellow-400 text-xs font-medium mb-1">Warnings:</div>
                {impactResults.warnings.map((warning: string, index: number) => (
                  <div key={index} className="text-yellow-300 text-xs">{warning}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}