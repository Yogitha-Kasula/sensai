"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function PerformanceChart({ assessments }) {
  if (!assessments || assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Your quiz scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No data available yet. Take a quiz to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  const data = [...assessments].reverse().map((a, index) => ({
    date: format(new Date(a.createdAt), "MMM dd"),
    quizName: `Quiz ${index + 1}`,
    score: a.quizScore,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Performance Trend</CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="quizName" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-md">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
                        <p className="text-sm font-semibold mt-1">Score: {payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
