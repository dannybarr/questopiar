import { Navigate } from "react-router-dom";
import { useProfile } from "@/lib/store";

const Index = () => {
  const profile = useProfile();
  return <Navigate to={profile.location ? "/quests" : "/onboarding"} replace />;
};

export default Index;
