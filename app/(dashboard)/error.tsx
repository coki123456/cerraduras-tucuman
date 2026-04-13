// @ts-nocheck
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorDashboard({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-base font-medium text-foreground">
        Ocurrió un error inesperado
      </p>
      <p className="text-sm">{error.message}</p>
      <Button variant="outline" onClick={reset}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
