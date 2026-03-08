// src/pages/stock/News.tsx
import { useParams } from 'react-router-dom';
 
const MOCK_NEWS = [
  'Q3 results beat estimates by 4%',
  'Board approves ₹18/share dividend',
  'New AI partnership announced',
];
 
export default function News() {
  const { symbol } = useParams<{ symbol: string }>();
 
  return (
    <div>
      <h3>News — {symbol}</h3>
      {MOCK_NEWS.map((headline, i) => (
        <p key={i} style={{ borderBottom: '1px solid #222', padding: '8px 0' }}>
          {headline}
        </p>
      ))}
    </div>
  );
}
