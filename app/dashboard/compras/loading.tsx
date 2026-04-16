// @ts-nocheck
import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoCompras() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-7 w-28" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 p-4 flex items-center justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
