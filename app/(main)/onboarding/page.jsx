import { industries } from "@/data/industries";
import { redirect } from "next/navigation";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus, getUserProfile } from "@/actions/user";

const OnboardingPage = async () => {
  // Check if user is already onboarded
  const { isOnboarded } = await getUserOnboardingStatus();
  const user = await getUserProfile();

  let initialData = null;
  if (user) {
    let selectedIndustry = "";
    let selectedSubIndustry = "";
    
    // Reverse engineer the industry/subIndustry from user.industry string
    if (user.industry) {
      for (const ind of industries) {
        for (const sub of ind.subIndustries) {
          const formatted = `${ind.id}-${sub}`.toLowerCase().replace(/ /g, "-");
          if (formatted === user.industry) {
            selectedIndustry = ind.id;
            selectedSubIndustry = sub;
            break;
          }
        }
        if (selectedIndustry) break;
      }
    }

    initialData = {
      industry: selectedIndustry,
      subIndustry: selectedSubIndustry,
      experience: user.experience?.toString() || "",
      bio: user.bio || "",
      skills: user.skills || [],
    };
  }

  // if (isOnboarded) {
  //   redirect("/dashboard");
  // }

  return (
    <main>
      <OnboardingForm industries={industries} initialData={initialData} />
    </main>
  );
};

export default OnboardingPage;
