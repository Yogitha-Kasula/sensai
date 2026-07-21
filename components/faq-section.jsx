"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What makes Sensai unique as a career development tool?",
    answer: "Sensai leverages advanced AI to provide highly personalized career guidance, tailoring its advice and resources to your specific industry, experience level, and goals."
  },
  {
    question: "How does Sensai create tailored content?",
    answer: "Our AI analyzes your profile, resume, and career aspirations against real-time industry data to generate custom interview questions, resume suggestions, and actionable feedback."
  },
  {
    question: "How accurate and up-to-date are Sensai's industry insights?",
    answer: "Sensai continuously aggregates data from top job boards, salary databases, and industry reports to ensure you receive the most current market trends and compensation data."
  },
  {
    question: "Is my data secure with Sensai?",
    answer: "Absolutely. We employ industry-standard encryption and strict data privacy protocols. Your personal information and career documents are never shared without your explicit consent."
  },
  {
    question: "How can I track my interview preparation progress?",
    answer: "Sensai provides a comprehensive dashboard where you can review past mock interviews, track your performance metrics, and see targeted areas for improvement over time."
  },
  {
    question: "Can I edit the AI-generated content?",
    answer: "Yes! All AI-generated resumes, cover letters, and answers are fully editable. You can easily tweak the content to ensure it perfectly matches your voice and personal brand."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl">
            Find answers to common questions about our platform
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border-b border-border/50"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="flex justify-between items-center w-full text-left font-medium py-6 transition-colors hover:text-primary"
              >
                {faq.question}
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-muted-foreground pb-4 pr-12 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
