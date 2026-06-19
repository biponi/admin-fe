import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { navItems } from "../../utils/navItem";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { ChevronRight, Activity } from "lucide-react";
import MainView from "@/coreComponents/mainView";

interface PageCard {
  title: string;
  url: string;
  icon: React.ReactNode;
  isActive: boolean;
  id: string;
}

const AgentView: React.FC = () => {
  const { user } = useLoginAuth();
  const { hasRequiredPermission } = useRoleCheck();
  const pathName = useLocation().pathname;
  const navigate = useNavigate();

  const filteredNavItems: PageCard[] = navItems
    .filter((nav) => nav.active && hasRequiredPermission(nav.id, "view"))
    .map((item) => ({
      title: item.title,
      url: item.link,
      icon: item.icon,
      isActive: pathName.includes(item.link),
      id: item.id,
    }));

  const handleCardClick = (url: string) => {
    navigate(url);
  };

  if (!user) {
    return (
      <MainView title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading user data...</p>
          </div>
        </div>
      </MainView>
    );
  }

  return (
    <MainView title="Dashboard">
      <div className="min-h-screen bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  Welcome back, {user?.name || "Agent"}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Access your available modules and manage your tasks
                </p>
              </div>
            </div>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-indigo-600 leading-none">
                  {filteredNavItems.length}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Available Modules</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-emerald-600 leading-none">
                  {filteredNavItems.filter(item => item.isActive).length}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Currently Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-violet-600 leading-none truncate">
                  {user?.role || "Agent"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Your Access Level</p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredNavItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-2">
                No Modules Available
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto px-4">
                You don't have access to any modules at the moment. Contact your administrator to get the necessary permissions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredNavItems.map((item) => (
                <Card
                  key={item.id}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md border bg-white ${
                    item.isActive
                      ? "ring-2 ring-indigo-500/20 border-indigo-300/50"
                      : "hover:border-slate-200"
                  } touch-manipulation`}
                  onClick={() => handleCardClick(item.url)}
                >
                  <CardContent className="p-3 sm:p-6">
                    {/* Active Indicator */}
                    {item.isActive && (
                      <div className="absolute top-3 right-3">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-50 flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {React.cloneElement(item.icon as React.ReactElement, {
                        className: "w-4 h-4 sm:w-6 sm:h-6 text-indigo-600"
                      })}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-lg group-hover:text-slate-700 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 hidden sm:block">
                        Access and manage {item.title.toLowerCase()} related tasks and data
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainView>
  );
};

export default AgentView;