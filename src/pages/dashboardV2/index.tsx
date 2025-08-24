import { useSelector } from "react-redux";
import { hasPagePermission } from "../../utils/helperFunction";
import AgentView from "./agentView";
import DashboardPage from "./DashboardPage";

const DashboardV2 = () => {
  const user = useSelector((state: any) => state?.user);
  const userPermissions = user?.permissions || [];
  return hasPagePermission("Dashboard", "view", userPermissions) ? (
    <DashboardPage />
  ) : (
    <AgentView />
  );
};

export default DashboardV2;
