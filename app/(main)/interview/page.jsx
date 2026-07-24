import React from "react";
import { getAssessments } from "@/actions/interview";
import PerformanceChart from "@/components/performance-chart";
import QuizList from "@/components/quiz-list";
import StatCards from "@/components/stat-cards";

const InterviewPage = async () => {
  const assessments = await getAssessments();

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold font-gradient">Interview Preparation</h1>
      </div>
      <StatCards assessments={assessments} />
      <PerformanceChart assessments={assessments} />
      <QuizList assessments={assessments} />
    </div>
  );
};

export default InterviewPage;
