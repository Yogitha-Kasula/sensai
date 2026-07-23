import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_components/dashboard-view";
import { redirect } from "next/navigation";

const IndustryInsightsPage = async () => {
  const insights = await getIndustryInsights();

  if (!insights) {
    redirect("/onboarding");
  }

  return (
    <div>
      <DashboardView insights={insights} />
    </div>
  );
};

export default IndustryInsightsPage;
