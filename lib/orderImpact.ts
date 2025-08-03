export interface OrderImpactResult {
  fillPercentage: number;
  slippage: number;
  marketImpact: number;
  estimatedFillTime: number;
  warnings: string[];
  averageFillPrice: number;
}

export function calculateOrderImpact(order: any, orderbook: any): OrderImpactResult {
  const { side, price, quantity, type } = order;
  const levels = side === 'buy' ? orderbook.asks : orderbook.bids;
  
  let remainingQuantity = quantity;
  let totalCost = 0;
  let levelsConsumed = 0;
  const warnings: string[] = [];

  // Calculate fill simulation
  for (const level of levels) {
    if (remainingQuantity <= 0) break;
    
    const fillableQuantity = Math.min(remainingQuantity, level.size);
    totalCost += fillableQuantity * level.price;
    remainingQuantity -= fillableQuantity;
    levelsConsumed++;

    if (levelsConsumed > 5) {
      warnings.push("Order consumes more than 5 price levels");
    }
  }

  const fillPercentage = ((quantity - remainingQuantity) / quantity) * 100;
  const averageFillPrice = totalCost / (quantity - remainingQuantity);
  
  // Calculate slippage
  const referencePrice = type === 'market' 
    ? (side === 'buy' ? levels[0]?.price : levels[0]?.price)
    : price;
    
  const slippage = Math.abs((averageFillPrice - referencePrice) / referencePrice) * 100;
  
  // Estimate market impact in dollars
  const marketImpact = Math.abs(averageFillPrice - referencePrice) * (quantity - remainingQuantity);
  
  // Estimate fill time based on market conditions and order size
  const estimatedFillTime = Math.max(0.5, levelsConsumed * 0.3 + (quantity / 10));

  // Add warnings based on impact
  if (slippage > 0.5) {
    warnings.push("High slippage detected (>0.5%)");
  }
  
  if (fillPercentage < 95) {
    warnings.push("Order may not fill completely");
  }
  
  if (marketImpact > 1000) {
    warnings.push("Significant market impact (>$1000)");
  }

  return {
    fillPercentage: Math.round(fillPercentage * 100) / 100,
    slippage: Math.round(slippage * 1000) / 1000,
    marketImpact: Math.round(marketImpact),
    estimatedFillTime: Math.round(estimatedFillTime * 10) / 10,
    warnings,
    averageFillPrice: Math.round(averageFillPrice * 100) / 100
  };
}

export function calculateImbalanceIndicator(orderbook: any): number {
  if (!orderbook?.bids?.[0] || !orderbook?.asks?.[0]) return 0;
  
  const bidVolume = orderbook.bids.slice(0, 10).reduce((sum: number, bid: any) => sum + bid.size, 0);
  const askVolume = orderbook.asks.slice(0, 10).reduce((sum: number, ask: any) => sum + ask.size, 0);
  
  return ((bidVolume - askVolume) / (bidVolume + askVolume)) * 100;
}