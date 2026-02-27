import * as React from 'react';

import { cn } from '@/lib/utils';

export function combobox({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded border p-2', className)} {...props}>
      {children ?? 'combobox component placeholder'}
    </div>
  );
}
