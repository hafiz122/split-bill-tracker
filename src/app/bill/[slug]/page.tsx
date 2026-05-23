import { Suspense } from "react";
import { BillViewClient } from "./client";

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ slug: "demo" }];
}

export default async function BillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center">
          <div className="animate-pulse text-[var(--color-text-muted)]">
            loading...
          </div>
        </div>
      }
    >
      <BillViewClient slug={slug} />
    </Suspense>
  );
}
