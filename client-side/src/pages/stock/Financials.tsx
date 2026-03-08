// src/pages/stock/Financials.tsx
import { useParams } from 'react-router-dom';
 
export default function Financials() {
  const { symbol } = useParams<{ symbol: string }>();
 
  return (
    <div>
      <h3>Financials — {symbol}</h3>
      <p>Revenue: ₹2,40,893 Cr</p>
      <p>Net Profit: ₹46,099 Cr</p>
      <p>EPS: ₹124.6</p>
    </div>
  );
}
