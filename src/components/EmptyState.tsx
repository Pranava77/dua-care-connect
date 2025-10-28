import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        {Icon && (
          <div className="mb-6 rounded-full bg-muted p-6">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-headline-2 font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-body text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="hover:scale-105 transition-transform">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export { EmptyState };
