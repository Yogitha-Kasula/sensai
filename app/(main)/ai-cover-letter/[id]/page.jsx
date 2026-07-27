import { getCoverLetter } from "@/actions/cover-letter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterPreview from "../_components/cover-letter-preview";

export default async function CoverLetterDetailPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  if (!coverLetter) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Cover Letter Not Found</h1>
        <Link href="/ai-cover-letter">
          <Button>Return to Cover Letters</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center no-print">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="pl-0 text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>
      </div>

      <div className="space-y-2 no-print">
        <h1 className="text-4xl font-bold tracking-tight">{coverLetter.jobTitle} at {coverLetter.companyName}</h1>
      </div>

      <CoverLetterPreview initialContent={coverLetter.content} />
    </div>
  );
}
