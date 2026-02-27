import * as React from 'react';

import { cn } from '@/lib/utils';

export function command({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded border p-2', className)} {...props}>
      {children ?? 'command component placeholder'}
    </div>
  );
}
