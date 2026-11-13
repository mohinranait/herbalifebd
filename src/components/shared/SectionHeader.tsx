"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  seeAllLink?: string;
  seeAllText?: string;
  seeAllKey?: string;
  icon?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  titleKey,
  description,
  descriptionKey,
  seeAllLink,
  seeAllText = 'সবগুলো দেখুন',
  seeAllKey = 'see-all-text',
  icon,
  className
}: Props) {
  const t = useTranslation();

  const displayTitle = (titleKey && t[titleKey]) || t[title] || title;
  const displayDescription = (descriptionKey && t[descriptionKey]) || description;
  const displaySeeAllText = (seeAllKey && t[seeAllKey]) || t[seeAllText] || seeAllText;

  return (
    <div className={cn("container mx-auto px-2 md:px-4 mb-4 md:mb-6", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl md:text-2xl">{icon}</span>}
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight">
              {displayTitle}
            </h2>
            {displayDescription && (
              <p className="text-xs md:text-sm text-slate-500 line-clamp-1">
                {displayDescription}
              </p>
            )}
          </div>
        </div>

        {seeAllLink && (
          <Link
            href={seeAllLink}
            className="text-xs md:text-sm font-semibold text-brand hover:opacity-80 flex items-center gap-1 transition-colors"
          >
            <span>{displaySeeAllText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
