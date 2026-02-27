import * as React from 'react';

import { cn } from '@/lib/utils';

export function context_menu({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded border p-2', className)} {...props}>
      {children ?? 'context-menu component placeholder'}
    </div>
  );
}
