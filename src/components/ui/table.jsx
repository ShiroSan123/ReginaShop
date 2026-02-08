import * as React from "react"

import { cn } from "@/lib/utils"

/** @type {import("react").ForwardRefExoticComponent<import("react").ComponentPropsWithoutRef<"table"> & import("react").RefAttributes<any>>} */
const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props} />
  </div>
))
Table.displayName = "Table"

/** @type {import("react").ForwardRefExoticComponent<import("react").ComponentPropsWithoutRef<"thead"> & import("react").RefAttributes<any>>} */
const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

/** @type {import("react").ForwardRefExoticComponent<import("react").ComponentPropsWithoutRef<"tbody"> & import("react").RefAttributes<any>>} */
const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props} />
))
TableBody.displayName = "TableBody"

/** @type {import("react").ForwardRefExoticComponent<import("react").ComponentPropsWithoutRef<"tfoot"> & import("react").RefAttributes<any>>} */
const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props} />
))
TableFooter.displayName = "TableFooter"

/** @type {import("react").ForwardRefExoticComponent<import("react").ComponentPropsWithoutRef<"tr"> & import("react").RefAttributes<any>>} */
const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props} />
))
TableRow.displayName = "TableRow"

/** @type {import("react").ForwardRefExoticComponent<import("react").ComponentPropsWithoutRef<"th"> & import("react").RefAttributes<any>>} */
const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableHead.displayName = "TableHead"

/** @type {import("react").ForwardRefExoticComponent<import("react").ComponentPropsWithoutRef<"td"> & import("react").RefAttributes<any>>} */
const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableCell.displayName = "TableCell"

/** @type {import("react").ForwardRefExoticComponent<import("react").ComponentPropsWithoutRef<"caption"> & import("react").RefAttributes<any>>} */
const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props} />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
