"use client";

import { Loader, Stack } from "@mantine/core";

/**
 * App-wide loading indicator: a centered spinner, no text. The legacy
 * `*Skeleton` exports below keep their names/props so existing callers
 * (managers, widgets, route loading files) need no changes.
 */
export function LoadingSpinner() {
  return (
    <Stack align="center" justify="center" py="xl">
      <Loader size="lg" variant="oval" aria-label="Loading" />
    </Stack>
  );
}

export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  void lines;
  return <LoadingSpinner />;
}

export function StackedCardsSkeleton({ count = 3 }: { count?: number }) {
  void count;
  return <LoadingSpinner />;
}

export function ListPageSkeleton({ rows = 6 }: { rows?: number }) {
  void rows;
  return <LoadingSpinner />;
}
