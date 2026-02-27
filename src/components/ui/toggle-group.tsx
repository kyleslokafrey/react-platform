import * as React from 'react';

import { cn } from '@/lib/utils';

export function toggle_group({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded border p-2', className)} {...props}>
      {children ?? 'toggle-group component placeholder'}
    </div>
  );
}
