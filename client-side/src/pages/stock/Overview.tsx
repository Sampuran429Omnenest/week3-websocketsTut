import { useStock } from './StockLayout';
 
export default function Overview() {
  const { symbol, ltp } = useStock();  // no useParams needed
  return <p>{symbol}: ₹{ltp}</p>;
}
