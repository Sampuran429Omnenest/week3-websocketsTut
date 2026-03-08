import  { memo } from "react";

type SparklineProps = {
  prices: number[];
  isGreen: boolean;
  width?: number;
  height?: number;
};

function Sparkline({ 
  prices, 
  isGreen, 
  width = 80, 
  height = 30 
}: SparklineProps) {
    
  // 1. Minimum 2 points required to draw a line
  if (!prices || prices.length < 2) {
    return <svg width={width} height={height} />;
  }

  // 2. Filter out any non-numeric values just in case
  const validPrices = prices.filter(p => typeof p === 'number' && !isNaN(p));
  if (validPrices.length < 2) return <svg width={width} height={height} />;

  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);
  const priceRange = maxPrice - minPrice || 1;

  // 3. Generate coordinates
  const points = validPrices.map((price, index) => {
    const x = (index / (validPrices.length - 1)) * width;
    // We add a 2px padding top and bottom so the line doesn't touch the SVG edge
    const y = height - ((price - minPrice) / priceRange) * (height - 4) - 2;
    
    // IMPORTANT: There must be a space between ${x} and ${y}
    return `${x} ${y}`; 
  });

  // 4. Construct the path (M = Move to start, L = Line to next point)
  const linePath = `M${points.join(" L")}`;
  const lineColor = isGreen ? "#00C87C" : "#FF4D4D";

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export default memo(Sparkline);