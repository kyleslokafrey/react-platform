import * as React from 'react';

import { cn } from '@/lib/utils';

export function radio_group({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded border p-2', className)} {...props}>
      {children ?? 'radio-group component placeholder'}
    </div>
  );
}
