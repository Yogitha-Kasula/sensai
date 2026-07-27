"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateCoverLetter } from "@/actions/cover-letter";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().optional(),
});

export default function CreateCoverLetterPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      jobTitle: "",
      jobDescription: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsGenerating(true);
      const result = await generateCoverLetter(data);
      if (result.success && result.coverLetter) {
        toast.success("Cover letter generated successfully!");
        router.push(`/ai-cover-letter/${result.coverLetter.id}`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Link href="/ai-cover-letter">
        <Button variant="link" className="pl-0 text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cover Letters
        </Button>
      </Link>

      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Create Cover Letter</h1>
        <p className="text-muted-foreground">Generate a tailored cover letter for your job application</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Provide information about the position you're applying for</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  {...register("companyName")}
                  className={errors.companyName ? "border-red-500" : ""}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-500">{errors.companyName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Enter job title"
                  {...register("jobTitle")}
                  className={errors.jobTitle ? "border-red-500" : ""}
                />
                {errors.jobTitle && (
                  <p className="text-xs text-red-500">{errors.jobTitle.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here"
                className="min-h-[200px]"
                {...register("jobDescription")}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
