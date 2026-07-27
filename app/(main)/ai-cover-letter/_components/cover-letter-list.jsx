"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteCoverLetter } from "@/actions/cover-letter";

export default function CoverLetterList({ coverLetters }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this cover letter? This action cannot be undone.")) {
      try {
        await deleteCoverLetter(id);
        toast.success("Cover letter deleted successfully!");
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Failed to delete cover letter");
      }
    }
  };

  return (
    <div className="space-y-4">
      {coverLetters.map((letter) => (
        <Card key={letter.id} className="group relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  {letter.jobTitle} at {letter.companyName}
                </CardTitle>
                <CardDescription>
                  Created {format(new Date(letter.createdAt), "PPP")}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => router.push(`/ai-cover-letter/${letter.id}`)}
                  title="View Cover Letter"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleDelete(letter.id)}
                  title="Delete Cover Letter"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {/* Optionally show a snippet of the job description or keep it clean as requested */}
          {/* <CardContent>
            <p className="text-sm text-muted-foreground truncate">{letter.jobDescription || "No description provided"}</p>
          </CardContent> */}
        </Card>
      ))}
    </div>
  );
}
