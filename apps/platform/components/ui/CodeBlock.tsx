'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'json', className, ...props }: CodeBlockProps) {
  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {language}
        </span>
      </div>
      <pre
        className={cn(
          'p-4 rounded-lg bg-muted text-muted-foreground overflow-x-auto text-sm font-mono',
          className
        )}
        {...props}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
