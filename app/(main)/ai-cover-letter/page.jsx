import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Cover Letters</h1>
          <p className="text-muted-foreground">Manage your AI-generated cover letters</p>
        </div>
        <Link href="/ai-cover-letter/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Button>
        </Link>
      </div>

      {coverLetters.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Cover Letters Yet</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            Create your first tailored cover letter by providing a job description and company name.
          </p>
          <Link href="/ai-cover-letter/new">
            <Button>Create Cover Letter</Button>
          </Link>
        </Card>
      ) : (
        <CoverLetterList coverLetters={coverLetters} />
      )}
    </div>
  );
}
