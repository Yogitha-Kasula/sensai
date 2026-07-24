import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QuizResult({ result, hideStartNew, onStartNew }) {
  if (!result) return null;

  return (
    <div className="mx-auto">
      <h1 className="flex items-center gap-2 text-3xl font-gradient">
        <Trophy className="h-8 w-8 text-yellow-500" />
        Quiz Results
      </h1>
      
      {/* Score */}
      <div className="my-8 text-center">
        <p className="text-5xl font-bold font-gradient">
          {result.quizScore.toFixed(1)}%
        </p>
      </div>

      {/* Improvement Tip */}
      {result.improvementTip && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-primary mb-2">Improvement Tip:</h3>
            <p className="text-sm text-muted-foreground">{result.improvementTip}</p>
          </CardContent>
        </Card>
      )}

      {/* Question Review */}
      <h2 className="text-xl font-semibold mb-4">Question Review</h2>
      <div className="space-y-4">
        {result.questions.map((q, index) => (
          <Card key={index} className={q.isCorrect ? "border-green-500/30" : "border-red-500/30"}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{q.question}</p>
                {q.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>
                  Your answer: {q.userAnswer}
                </p>
                {!q.isCorrect && (
                  <p>
                    Correct answer: {q.answer}
                  </p>
                )}
              </div>
              <div className="bg-muted p-4 rounded-lg mt-4 text-sm">
                <p className="font-medium mb-1">Explanation:</p>
                <p className="text-muted-foreground">{q.explanation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hideStartNew && (
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={onStartNew}>
            Start New Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
