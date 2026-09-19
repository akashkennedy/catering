"use client";

import { Skeleton, Stack } from "@mantine/core";

export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="dash-card">
      <Stack gap="md">
        <Skeleton height={16} width="40%" radius="sm" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={20} radius="sm" />
        ))}
      </Stack>
    </div>
  );
}

export function StackedCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Stack gap={40}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </Stack>
  );
}

export function ListPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Stack gap="lg">
      <Skeleton height={36} width="60%" radius="sm" />
      <div className="dash-card">
        <Stack gap="md">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} height={20} radius="sm" />
          ))}
        </Stack>
      </div>
    </Stack>
  );
}
