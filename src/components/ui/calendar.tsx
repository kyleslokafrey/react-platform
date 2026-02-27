import * as React from 'react';

import { cn } from '@/lib/utils';

export function calendar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded border p-2', className)} {...props}>
      {children ?? 'calendar component placeholder'}
    </div>
  );
}
