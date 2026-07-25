"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);



  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Recent Quizzes</h2>
          <p className="text-muted-foreground">Review your past quiz performance</p>
        </div>
        <Button onClick={() => router.push("/interview/mock")}>
          Start New Quiz
        </Button>
      </div>

      {(!assessments || assessments.length === 0) ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No recent quizzes found. Start one to see your performance!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((quiz, i) => (
            <Card
              key={quiz.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedQuiz(quiz)}
            >
              <CardHeader>
                <CardTitle className="text-lg">Quiz {assessments.length - i}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <span>Score: {quiz.quizScore.toFixed(1)}%</span>
                  <span>{format(new Date(quiz.createdAt), "MMMM dd, yyyy HH:mm")}</span>
                </div>
                {quiz.improvementTip && (
                  <p className="text-sm text-muted-foreground">
                    {quiz.improvementTip}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedQuiz(null)}>
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background border rounded-lg shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4" 
              onClick={() => setSelectedQuiz(null)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <QuizResult result={selectedQuiz} hideStartNew={true} />
          </div>
        </div>
      )}
    </div>
  );
}
