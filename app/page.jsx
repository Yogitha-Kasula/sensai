import HeroSection from "@/components/hero";
import FaqSection from "@/components/faq-section";
import { Button } from "@/components/ui/button";
import { 
  BrainCircuit, 
  Briefcase, 
  LineChart, 
  ScrollText,
  Trophy,
  Target,
  Sparkles,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 mb-4 text-primary" />,
    title: "AI-Powered Career Guidance",
    description: "Get personalized career advice and insights powered by advanced AI technology."
  },
  {
    icon: <Briefcase className="w-10 h-10 mb-4 text-primary" />,
    title: "Interview Preparation",
    description: "Practice with role-specific questions and get instant feedback to improve your performance."
  },
  {
    icon: <LineChart className="w-10 h-10 mb-4 text-primary" />,
    title: "Industry Insights",
    description: "Stay ahead with real-time industry trends, salary data, and market analysis."
  },
  {
    icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
    title: "Smart Resume Creation",
    description: "Generate ATS-optimized resumes with AI assistance."
  }
];

const howItWorks = [
  {
    title: "Build Your Resume",
    description: "Create an ATS-optimized resume with AI assistance",
    icon: <Trophy className="w-8 h-8 text-primary" />,
  },
  {
    title: "Get AI Feedback",
    description: "Receive personalized suggestions and improvement tips",
    icon: <Target className="w-8 h-8 text-primary" />,
  },
  {
    title: "Practice Interviews",
    description: "Prepare with AI-generated role-specific questions",
    icon: <Sparkles className="w-8 h-8 text-primary" />,
  },
  {
    title: "Track Progress",
    description: "Monitor your improvement with detailed analytics",
    icon: <CheckCircle className="w-8 h-8 text-primary" />,
  }
];

const stats = [
  { value: "50+", label: "Industries Covered" },
  { value: "1000+", label: "Interview Questions" },
  { value: "95%", label: "Success Rate" },
  { value: "24/7", label: "AI Support" },
];

const testimonials = [
  {
    quote: "The AI resume builder completely transformed my job hunt. I was struggling to get past ATS filters, but now I'm landing interviews every week.",
    author: "David Kim",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Data Analyst",
    company: "FinTech Solutions",
  },
  {
    quote: "I love the personalized interview feedback. It pointed out blind spots in my communication style I never would have noticed on my own.",
    author: "Jessica Parker",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "UI/UX Designer",
    company: "Creative Agency",
  },
  {
    quote: "Having real-time industry insights and salary data gave me the confidence to negotiate a 20% bump in my starting offer. Highly recommend!",
    author: "Marcus Johnson",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    role: "Senior Developer",
    company: "NextGen Tech",
  },
];

export default function Home() {
  return (
    <div>
      <div className="grid-background"></div>

      <HeroSection />

      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            Powerful Features for Your Career Growth
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:border-white hover:shadow-md cursor-pointer"
              >
                {feature.icon}
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-4xl font-bold">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              Four simple steps to accelerate your career growth
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {howItWorks.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-8 rounded-xl border border-transparent hover:border-white hover:bg-card/50 transition-all hover:shadow-md cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="flex flex-col p-8 rounded-xl bg-background border border-border/50 shadow-sm"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.author}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
                <blockquote className="relative">
                  <p className="text-muted-foreground italic leading-relaxed relative z-10">
                    <span className="text-2xl text-primary font-serif leading-none mr-1">"</span>
                    {testimonial.quote}
                    <span className="text-2xl text-primary font-serif leading-none ml-1">"</span>
                  </p>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      {/* CTA Section */}
      <section className="w-full py-24 lg:py-32 bg-gradient-to-b from-gray-300 via-gray-100 to-gray-300 text-gray-900">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-gray-700">
            Join thousands of professionals who are advancing their careers with AI-powered guidance.
          </p>
          <Button size="lg" className="px-8 bg-gray-900 text-gray-50 hover:bg-gray-800 rounded-md group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            Start Your Journey Today <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </section>
    </div>
  );
}