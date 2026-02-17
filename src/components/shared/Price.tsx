import { formatPrice, calculateDiscount } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PriceProps {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  showDiscount?: boolean;
}

export function Price({ price, compareAtPrice, className, showDiscount = true }: PriceProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discount = hasDiscount ? calculateDiscount(price, compareAtPrice) : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(compareAtPrice)}
          </span>
          {showDiscount && discount > 0 && (
            <Badge variant="destructive" className="ml-1">
              -{discount}%
            </Badge>
          )}
        </>
      )}
    </div>
  );
}
