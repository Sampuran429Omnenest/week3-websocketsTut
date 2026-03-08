// StockLayout.tsx — pass data via context
import { Outlet, useOutletContext, useParams } from 'react-router-dom';
 
type StockContext = { symbol: string; ltp: number };
 
export default function StockLayout() {
  const { symbol } = useParams<{ symbol: string }>();
  const ltp = 3875.20; // replace with live data
 
  return (
    <div>
      <h2>{symbol} — ₹{ltp}</h2>
      <nav>/* tabs */</nav>
      <Outlet context={{ symbol, ltp } satisfies StockContext} />
    </div>
  );
}
 
// Any tab — read the context
function useStock() {
  return useOutletContext<StockContext>();
}
export default useStock;