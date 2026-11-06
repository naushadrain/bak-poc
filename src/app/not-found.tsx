import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="flex w-full max-w-md flex-col items-center gap-3 p-8 text-center">
        <SearchX aria-hidden="true" className="size-10 text-taupe" />
        <h2 className="text-xl font-semibold text-ink">Page Not Found</h2>
        <p className="text-sm text-ink2">This page doesn&apos;t exist or hasn&apos;t been built yet.</p>
        <Link
          href="/"
          className="mt-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink2"
        >
          Back to Home
        </Link>
      </Card>
    </div>
  );
}
