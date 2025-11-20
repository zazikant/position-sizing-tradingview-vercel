# TypeScript Development Document: Real-Time Position Sizing Calculator

## 1. Overview
Build a real-time position sizing calculator that mirrors the Excel logic. Users input values into specific fields, and all dependent calculations update automatically without needing to click a "submit" button. The interface should feel seamless and responsive, with calculations updating instantly upon user input.

---

## 2. Core Logic & Formulas (Replicating Excel Sheet)

### 2.1 Input Fields (User-Editable)
- **G10**: Actual Price (numeric input)
- **H10**: Leverage Price (numeric input)
- **B4**: Current Price (High) (numeric input)
- **D4**: Current Price (Low) (numeric input)
- **B6**: Trade Direction (dropdown: "Long", "Short")
- **B22**: Initial Capital (numeric input)
- **B16**: Actual TP Percentage (numeric input, default 0.33)
- **B5**: Position Sizing (numeric input, user-adjustable)

### 2.2 Calculated Fields (Auto-Computed)
- **B3**: % Profit = `B16 / 100`
- **B2**: TP Target = `B6 === "Long" ? B3 * B4 : B3 * D4`
- **D2**: Exit Position Value (Long) = `B4 + B2`
- **E2**: Exit Position Value (Short) = `D4 - B2`
- **B9**: Notional Value = `B4 * B5`
- **B7**: Leverage = `G10 / H10`
- **B8**: Basic Capital = `(B4 * B5) / B7`
- **B12**: Price Moved Against = `B4 - D4`
- **B13**: Loss Without Tax = `(B12 / B4) * B9`
- **B10**: Leveraged Notional Value = `B7 * B9`
- **B17**: Wanted Profit = `(B16 / 100) * B9`
- **B18**: Total Losses (Max Drawdown) = `B13 * B15`
- **B19**: Min Capital to Avoid Liquidation = `B18 + B8 + (0.01 * B9)`
- **B23**: % Capital Used = `((1 - (B22 - B8) / B22) * 100)`
- **B24**: Max Qty (98% Capital) = `(98 / B23) * B5`

### 2.3 Constants
- **B15**: Number of Times Losses Factor (numeric input, default TBD by user)

---

## 3. Implementation Requirements

### 3.1 Framework
- Use React with TypeScript for the UI.
- Use `useState` hooks for state management.
- Implement `useEffect` hooks to trigger calculations when dependent values change.

### 3.2 State Management
```typescript
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
```

### 3.3 Calculation Logic (Pseudo-Code)
```typescript
const calculateDerivedValues = (inputs: Partial<PositionSizingState>): Partial<PositionSizingState> => {
  const {
    G10, H10, B4, D4, B6, B22, B16 = 0.33, B5, B15
  } = inputs;

  // Ensure no division by zero
  const leverage = H10 !== 0 ? G10 / H10 : 0;
  const notionalValue = B4 * B5;
  const basicCapital = leverage !== 0 ? (B4 * B5) / leverage : 0;

  return {
    B3: B16 / 100,
    B2: B6 === 'Long' ? (B16 / 100) * B4 : (B16 / 100) * D4,
    D2: B4 + (B6 === 'Long' ? (B16 / 100) * B4 : (B16 / 100) * D4),
    E2: D4 - (B6 === 'Long' ? (B16 / 100) * B4 : (B16 / 100) * D4),
    B9: notionalValue,
    B7: leverage,
    B8: basicCapital,
    B12: B4 - D4,
    B13: B4 !== 0 ? ((B4 - D4) / B4) * notionalValue : 0,
    B10: leverage * notionalValue,
    B17: (B16 / 100) * notionalValue,
    B18: B15 ? ((B4 - D4) / B4) * notionalValue * B15 : 0,
    B19: B15 ? (
      ((B4 - D4) / B4) * notionalValue * B15 + 
      basicCapital + 
      (0.01 * notionalValue)
    ) : 0,
    B23: B22 !== 0 ? ((1 - (B22 - basicCapital) / B22) * 100) : 0,
    B24: B23 !== 0 ? (98 / B23) * B5 : 0,
  };
};
```

### 3.4 UI Components
- **Input Fields**: Numeric inputs for G10, H10, B4, D4, B22, B16, B5, B15.
- **Dropdown**: For B6 (Trade Direction).
- **Display Fields**: Read-only inputs or plain text to show calculated values (B2, D2, E2, B7, B8, etc.).
- **Layout**: Organize fields in a grid/table layout to mirror the Excel sheet visually if desired.

### 3.5 Event Handling
- Attach `onChange` handlers to all input fields (`G10`, `H10`, `B4`, `D4`, `B22`, `B16`, `B5`, `B15`) and the dropdown (`B6`).
- Each `onChange` should update the corresponding state variable.
- A `useEffect` hook should listen to all input state changes and call `calculateDerivedValues` to update the calculated fields.

### 3.6 Example React Component Structure (Pseudo-Code)
```tsx
import React, { useState, useEffect } from 'react';

const PositionSizingCalculator: React.FC = () => {
  const [state, setState] = useState<PositionSizingState>({
    G10: 0,
    H10: 0,
    B4: 0,
    D4: 0,
    B6: 'Long',
    B22: 0,
    B16: 0.33,
    B5: 0,
    B15: 1, // Example default
    // Initialize calculated fields to 0 or null
    B3: 0, B2: 0, D2: 0, E2: 0, B9: 0, B7: 0, B8: 0, B12: 0, B13: 0, B10: 0, B17: 0, B18: 0, B19: 0, B23: 0, B24: 0,
  });

  const calculateDerivedValues = (inputs: Partial<PositionSizingState>): Partial<PositionSizingState> => {
    // ... (logic from 3.3)
  };

  useEffect(() => {
    const derivedValues = calculateDerivedValues(state);
    setState(prev => ({ ...prev, ...derivedValues }));
  }, [state.G10, state.H10, state.B4, state.D4, state.B6, state.B22, state.B16, state.B5, state.B15]); // Dependency array

  const handleInputChange = (field: keyof PositionSizingState, value: number | 'Long' | 'Short') => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Render input fields */}
      <input type="number" value={state.G10} onChange={(e) => handleInputChange('G10', parseFloat(e.target.value) || 0)} placeholder="Actual Price (G10)" />
      <input type="number" value={state.H10} onChange={(e) => handleInputChange('H10', parseFloat(e.target.value) || 0)} placeholder="Leverage Price (H10)" />
      <input type="number" value={state.B4} onChange={(e) => handleInputChange('B4', parseFloat(e.target.value) || 0)} placeholder="Current Price (High) (B4)" />
      <input type="number" value={state.D4} onChange={(e) => handleInputChange('D4', parseFloat(e.target.value) || 0)} placeholder="Current Price (Low) (D4)" />
      <select value={state.B6} onChange={(e) => handleInputChange('B6', e.target.value as 'Long' | 'Short')}>
        <option value="Long">Long</option>
        <option value="Short">Short</option>
      </select>
      <input type="number" value={state.B22} onChange={(e) => handleInputChange('B22', parseFloat(e.target.value) || 0)} placeholder="Initial Capital (B22)" />
      <input type="number" value={state.B16} onChange={(e) => handleInputChange('B16', parseFloat(e.target.value) || 0)} placeholder="Actual TP % (B16)" />
      <input type="number" value={state.B5} onChange={(e) => handleInputChange('B5', parseFloat(e.target.value) || 0)} placeholder="Position Sizing (B5)" />
      <input type="number" value={state.B15} onChange={(e) => handleInputChange('B15', parseFloat(e.target.value) || 0)} placeholder="Losses Factor (B15)" />

      {/* Display calculated fields */}
      <div>TP Target (B2): {state.B2}</div>
      <div>Exit Long (D2): {state.D2}</div>
      <div>Exit Short (E2): {state.E2}</div>
      <div>Leverage (B7): {state.B7}</div>
      <div>Basic Capital (B8): {state.B8}</div>
      <div>% Capital Used (B23): {state.B23}</div>
      <div>Max Qty 98% (B24): {state.B24}</div>
      {/* ... render other calculated fields ... */}
    </div>
  );
};

export default PositionSizingCalculator;
```

---

## 4. Key Development Notes

- **Real-Time Updates**: The `useEffect` hook is crucial for triggering calculations automatically. It must depend on all state variables that can trigger a recalculation.
- **Error Handling**: Implement checks for potential division by zero (e.g., when `H10`, `B4`, or `B22` are 0).
- **Default Values**: Ensure `B16` defaults to `0.33` and `B6` defaults to `"Long"` on initial load.
- **Performance**: For a simple calculator like this, the `useEffect` approach is efficient. For more complex calculations, consider `useMemo` or debouncing techniques if performance becomes an issue (though unlikely here).
- **Styling**: The visual layout (e.g., grid, labels, styling of input vs. calculated fields) is flexible and can be tailored to match the original Excel sheet or a modern UI design.
