import { Suspense } from "react";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PropertyDetails } from "@/components/widgets/PropertyDetails";

type Params = PageProps<"/property/[estate_code]">["params"];

async function PropertyContent({ params }: { params: Params }) {
  const { estate_code } = await params;
  return <PropertyDetails estate_code={decodeURIComponent(estate_code)} />;
}

export default function PropertyPage({ params }: { params: Params }) {
  return (
    // The estate code is only known at request time, so it has to resolve inside Suspense.
    <Suspense
      fallback={
        <div className="p-4 sm:p-6 lg:p-8">
          <SkeletonLoader lines={6} className="h-8" label="Loading estate" />
        </div>
      }
    >
      <PropertyContent params={params} />
    </Suspense>
  );
}
