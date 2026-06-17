import { useNavigate } from "react-router-dom";
import MainView from "../../coreComponents/mainView";
import { Ticket, Users, BarChart3, Plus } from "lucide-react";

export default function CouponDashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Global Coupons",
      description:
        "Create and manage public coupons available to all customers",
      icon: Ticket,
      path: "/coupons/global",
    },
    {
      title: "Customer Coupons",
      description:
        "Assign personalized coupons to individual customers or segments",
      icon: Users,
      path: "/coupons/customer",
    },
    {
      title: "Analytics",
      description:
        "View usage statistics, customer segments, and performance metrics",
      icon: BarChart3,
      path: "/coupons/analytics",
    },
  ];

  const handleCreateCoupon = () => {
    navigate("/coupons/global/create");
  };

  return (
    <MainView title="Coupon Management">
      <div className="min-h-screen bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  Coupon Management
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Create, manage, and track coupons for your customers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateCoupon}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200">
                <Plus className="h-4 w-4" />
                Create Coupon
              </button>
            </div>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Global Coupons",
                value: "—",
                accent: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Customer Coupons",
                value: "—",
                accent: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Active Coupons",
                value: "—",
                accent: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Total Redeemed",
                value: "—",
                accent: "text-rose-600",
                bg: "bg-rose-50",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
                <div
                  className={`w-2 h-2 rounded-full ${stat.bg.replace("bg-", "bg-").replace("50", "400")}`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-lg font-semibold ${stat.accent} leading-none`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.title}
                  onClick={() => navigate(feature.path)}
                  className="group bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-200">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </MainView>
  );
}
