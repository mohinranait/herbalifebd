import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  seeAllLink?: string;
  seeAllText?: string;
  icon?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  description,
  seeAllLink,
  seeAllText = 'সবগুলো দেখুন',
  icon,
  className
}: Props) {
  return (
    <div className={cn("container mx-auto px-2 md:px-4 mb-4 md:mb-6", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl md:text-2xl">{icon}</span>}
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs md:text-sm text-slate-500 line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {seeAllLink && (
          <Link
            href={seeAllLink}
            className="text-xs md:text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
          >
            <span>{seeAllText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
