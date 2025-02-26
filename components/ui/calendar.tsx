'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row gap-4',
        month: 'w-full',
        month_caption:
          'relative mx-10 mb-1 flex h-8 items-center justify-center z-20',
        caption_label: 'text-sm font-medium',
        nav: 'absolute top-0 flex w-full justify-between z-10',
        button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 text-muted-foreground/80 hover:text-foreground p-0',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 text-muted-foreground/80 hover:text-foreground p-0',
        ),
        weekday: 'size-9 p-0 text-xs font-medium text-muted-foreground/80',
        day_button: `
					relative flex size-9 items-center justify-center whitespace-nowrap rounded-md p-0 text-foreground outline-offset-2 
					group-[[data-selected]:not(.dr-middle)]:[transition-property:color,background-color,border-radius,box-shadow] 
					group-[[data-selected]:not(.dr-middle)]:duration-150 focus:outline-hidden group-data-disabled:pointer-events-none 
					focus-visible:z-10 hover:bg-accent group-data-selected:bg-primary hover:text-foreground 
					group-data-selected:text-primary-foreground group-data-disabled:text-foreground/30 
					group-data-disabled:line-through group-data-outside:text-foreground/30 
					group-data-selected:group-data-outside:text-primary-foreground 
					focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 
					group-[.dr-start:not(.dr-end)]:rounded-e-none 
					group-[.dr-end:not(.dr-start)]:rounded-s-none group-[.dr-middle]:rounded-none 
					group-[.dr-middle]:group-data-selected:bg-accent 
					group-[.dr-middle]:group-data-selected:text-foreground transition-200
				`,
        day: 'group size-9 px-0 text-sm',
        range_start: 'dr-start',
        range_end: 'dr-end',
        range_middle: 'dr-middle',
        today: `
					*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] 
					*:after:-translate-x-1/2 rtl:*:after:translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.dr-middle)>*]:after:bg-background 
					[&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors
				`,
        outside:
          'text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground',
        hidden: 'invisible',
        week_number: 'size-9 p-0 text-xs font-medium text-muted-foreground/80',
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-4 w-4 rtl:rotate-180" />;
          } else {
            return <ChevronRight className="h-4 w-4 rtl:rotate-180" />;
          }
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
