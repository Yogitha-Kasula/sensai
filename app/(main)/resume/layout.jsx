import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function ResumeLayout({ children }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}>
        {children}
      </Suspense>
    </div>
  );
}
