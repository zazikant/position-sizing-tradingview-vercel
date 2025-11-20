'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PositionSizingState {
  // Input fields
  G10: number; // Actual Price
  H10: number; // Leverage Price
  B4: number; // Current Price (High)
  D4: number; // Current Price (Low)
  B6: 'Long' | 'Short'; // Trade Direction
  B22: number; // Initial Capital
  B16: number; // Actual TP Percentage (default 0.33)
  B5: number; // Position Sizing
  B15: number; // Number of Times Losses Factor

  // Calculated fields
  B3: number; // % Profit
  B2: number; // TP Target
  D2: number; // Exit Position Value (Long)
  E2: number; // Exit Position Value (Short)
  B9: number; // Notional Value
  B7: number; // Leverage
  B8: number; // Basic Capital
  B12: number; // Price Moved Against
  B13: number; // Loss Without Tax
  B10: number; // Leveraged Notional Value
  B17: number; // Wanted Profit
  B18: number; // Total Losses (Max Drawdown)
  B19: number; // Min Capital to Avoid Liquidation
  B23: number; // % Capital Used
  B24: number; // Max Qty (98% Capital)
}

const PositionSizingCalculator: React.FC = () => {
  const [state, setState] = useState<PositionSizingState>({
    // Input fields
    G10: 0,
    H10: 0,
    B4: 0,
    D4: 0,
    B6: 'Long',
    B22: 0,
    B16: 0.33,
    B5: 0,
    B15: 1,
    
    // Initialize calculated fields to 0
    B3: 0,
    B2: 0,
    D2: 0,
    E2: 0,
    B9: 0,
    B7: 0,
    B8: 0,
    B12: 0,
    B13: 0,
    B10: 0,
    B17: 0,
    B18: 0,
    B19: 0,
    B23: 0,
    B24: 0,
  });

  const calculateDerivedValues = (inputs: Partial<PositionSizingState>): Partial<PositionSizingState> => {
    const {
      G10, H10, B4, D4, B6, B22, B16 = 0.33, B5, B15
    } = inputs;

    // Ensure no division by zero
    const leverage = H10 !== 0 ? G10 / H10 : 0;
    const notionalValue = B4 * B5;
    const basicCapital = leverage !== 0 ? (B4 * B5) / leverage : 0;
    const profitPercentage = B16 / 100;
    const tpTarget = B6 === 'Long' ? profitPercentage * B4 : profitPercentage * D4;
    const exitLong = B4 + tpTarget;
    const exitShort = D4 - tpTarget;
    const priceMovedAgainst = B4 - D4;
    const lossWithoutTax = B4 !== 0 ? ((B4 - D4) / B4) * notionalValue : 0;
    const leveragedNotionalValue = leverage * notionalValue;
    const wantedProfit = profitPercentage * notionalValue;
    const totalLosses = B15 ? lossWithoutTax * B15 : 0;
    const minCapitalToAvoidLiquidation = B15 ? (
      totalLosses + basicCapital + (0.01 * notionalValue)
    ) : 0;
    const percentCapitalUsed = B22 !== 0 ? ((1 - (B22 - basicCapital) / B22) * 100) : 0;
    const maxQty98Percent = percentCapitalUsed !== 0 ? (98 / percentCapitalUsed) * B5 : 0;

    return {
      B3: profitPercentage,
      B2: tpTarget,
      D2: exitLong,
      E2: exitShort,
      B9: notionalValue,
      B7: leverage,
      B8: basicCapital,
      B12: priceMovedAgainst,
      B13: lossWithoutTax,
      B10: leveragedNotionalValue,
      B17: wantedProfit,
      B18: totalLosses,
      B19: minCapitalToAvoidLiquidation,
      B23: percentCapitalUsed,
      B24: maxQty98Percent,
    };
  };

  useEffect(() => {
    const derivedValues = calculateDerivedValues(state);
    setState(prev => ({ ...prev, ...derivedValues }));
  }, [state.G10, state.H10, state.B4, state.D4, state.B6, state.B22, state.B16, state.B5, state.B15]);

  const handleInputChange = (field: keyof PositionSizingState, value: number | 'Long' | 'Short') => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (isNaN(num) || !isFinite(num)) return '0.00';
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number): string => {
    return `${formatNumber(num, 2)}%`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Position Sizing Calculator</h1>
          <p className="text-muted-foreground">
            Calculate position sizing, leverage, and risk metrics in real-time
          </p>
        </div>

        {/* Input Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>
              Enter your trading parameters to see real-time calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Inputs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Price Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="G10">Actual Price (G10)</Label>
                  <Input
                    id="G10"
                    type="number"
                    value={state.G10}
                    onChange={(e) => handleInputChange('G10', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="H10">Leverage Price (H10)</Label>
                  <Input
                    id="H10"
                    type="number"
                    value={state.H10}
                    onChange={(e) => handleInputChange('H10', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="B4">Current Price (High) (B4)</Label>
                  <Input
                    id="B4"
                    type="number"
                    value={state.B4}
                    onChange={(e) => handleInputChange('B4', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="D4">Current Price (Low) (D4)</Label>
                  <Input
                    id="D4"
                    type="number"
                    value={state.D4}
                    onChange={(e) => handleInputChange('D4', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Trade Parameters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Trade Parameters</h3>
                <div className="space-y-2">
                  <Label htmlFor="B6">Trade Direction (B6)</Label>
                  <Select value={state.B6} onValueChange={(value) => handleInputChange('B6', value as 'Long' | 'Short')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Long">Long</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="B5">Position Sizing (B5)</Label>
                  <Input
                    id="B5"
                    type="number"
                    value={state.B5}
                    onChange={(e) => handleInputChange('B5', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="B16">Actual TP % (B16)</Label>
                  <Input
                    id="B16"
                    type="number"
                    step="0.01"
                    value={state.B16}
                    onChange={(e) => handleInputChange('B16', parseFloat(e.target.value) || 0)}
                    placeholder="0.33"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="B15">Losses Factor (B15)</Label>
                  <Input
                    id="B15"
                    type="number"
                    value={state.B15}
                    onChange={(e) => handleInputChange('B15', parseFloat(e.target.value) || 0)}
                    placeholder="1.00"
                  />
                </div>
              </div>

              {/* Capital Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Capital Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="B22">Initial Capital (B22)</Label>
                  <Input
                    id="B22"
                    type="number"
                    value={state.B22}
                    onChange={(e) => handleInputChange('B22', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculated Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Calculations</CardTitle>
              <CardDescription>Core position sizing metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">% Profit (B3)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatPercentage(state.B3)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">TP Target (B2)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Exit Position Long (D2)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.D2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Exit Position Short (E2)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.E2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Position Metrics</CardTitle>
              <CardDescription>Position sizing and leverage calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notional Value (B9)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B9)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Leverage (B7)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B7)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Basic Capital (B8)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B8)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Leveraged Notional (B10)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B10)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Risk and loss calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Price Moved Against (B12)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B12)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Loss Without Tax (B13)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B13)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Wanted Profit (B17)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B17)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Losses (B18)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B18)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capital Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Capital Requirements</CardTitle>
              <CardDescription>Capital usage and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Min Capital to Avoid Liquidation (B19)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B19)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">% Capital Used (B23)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatPercentage(state.B23)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Qty (98% Capital) (B24)</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">{formatNumber(state.B24)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Current Leverage</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatNumber(state.B7, 2)}x</p>
                </div>
                <Badge variant="secondary" className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                  B7
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Capital Usage</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatPercentage(state.B23)}</p>
                </div>
                <Badge variant="secondary" className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                  B23
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Notional Value</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatNumber(state.B9)}</p>
                </div>
                <Badge variant="secondary" className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                  B9
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PositionSizingCalculator;