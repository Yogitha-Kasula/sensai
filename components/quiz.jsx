"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import { BarLoader } from "react-spinners";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleStart = async () => {
    setIsGenerating(true);
    try {
      const q = await generateQuiz();
      setQuestions(q);
    } catch (error) {
      toast.error(error.message || "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const finishQuiz = async () => {
    setIsSaving(true);
    try {
      const score = calculateScore();
      const result = await saveQuizResult(questions, answers, score);
      setResultData(result);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    } finally {
      setIsSaving(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold mb-4">Generating your quiz...</h2>
        <BarLoader color="gray" width={"100%"} />
      </div>
    );
  }

  if (resultData) {
    return (
      <div className="mt-4">
        <QuizResult result={resultData} onStartNew={() => {
          setQuestions([]);
          setCurrentQuestion(0);
          setAnswers([]);
          setShowExplanation(false);
          setResultData(null);
          setIsGenerating(false);
          setIsSaving(false);
        }} />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card className="mx-2 mt-4">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="mx-2 mt-4">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-semibold">{question.question}</p>

        <RadioGroup
          value={answers[currentQuestion]}
          onValueChange={handleOptionSelect}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="bg-muted p-4 rounded-lg mt-4 text-sm">
            <p className="font-semibold mb-1">Explanation:</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        {!showExplanation && (
          <Button
            variant="outline"
            onClick={() => setShowExplanation(true)}
            disabled={!answers[currentQuestion]}
          >
            Show Explanation
          </Button>
        )}

        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || isSaving}
          className="ml-auto"
        >
          {isSaving
            ? "Saving..."
            : currentQuestion < questions.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
}
