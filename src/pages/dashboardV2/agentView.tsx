import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { navItems } from "../../utils/navItem";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { ChevronRight, Activity } from "lucide-react";

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

  const getCardGradient = (index: number) => {
    const gradients = [
      "from-blue-500/10 to-blue-600/5 border-blue-200/50",
      "from-purple-500/10 to-purple-600/5 border-purple-200/50", 
      "from-green-500/10 to-green-600/5 border-green-200/50",
      "from-orange-500/10 to-orange-600/5 border-orange-200/50",
      "from-pink-500/10 to-pink-600/5 border-pink-200/50",
      "from-indigo-500/10 to-indigo-600/5 border-indigo-200/50",
      "from-teal-500/10 to-teal-600/5 border-teal-200/50",
      "from-red-500/10 to-red-600/5 border-red-200/50",
    ];
    return gradients[index % gradients.length];
  };

  const getIconColors = (index: number) => {
    const colors = [
      "text-blue-600 bg-blue-100",
      "text-purple-600 bg-purple-100",
      "text-green-600 bg-green-100", 
      "text-orange-600 bg-orange-100",
      "text-pink-600 bg-pink-100",
      "text-indigo-600 bg-indigo-100",
      "text-teal-600 bg-teal-100",
      "text-red-600 bg-red-100",
    ];
    return colors[index % colors.length];
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || "Agent"}
            </h1>
            <p className="text-gray-600 mt-1">
              Access your available modules and manage your tasks
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary" className="px-3 py-1">
            {filteredNavItems.length} Available Modules
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Role: {user?.role || "Agent"}
          </Badge>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredNavItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Modules Available
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You don't have access to any modules at the moment. Contact your administrator to get the necessary permissions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNavItems.map((item, index) => (
            <Card
              key={item.id}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border bg-gradient-to-br ${getCardGradient(
                index
              )} ${
                item.isActive
                  ? "ring-2 ring-blue-500/20 border-blue-300/50"
                  : "hover:border-gray-300"
              }`}
              onClick={() => handleCardClick(item.url)}
            >
              <CardContent className="p-6">
                {/* Active Indicator */}
                {item.isActive && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${getIconColors(index)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: "w-6 h-6"
                  })}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-gray-700 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    Access and manage {item.title.toLowerCase()} related tasks and data
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredNavItems.length}
            </div>
            <div className="text-sm text-gray-600">Available Modules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredNavItems.filter(item => item.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Currently Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {user?.role || "Agent"}
            </div>
            <div className="text-sm text-gray-600">Your Access Level</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentView;