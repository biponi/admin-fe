import { useNavigate } from "react-router-dom";
import MainView from "../../../coreComponents/mainView";
import { UserPlus, Users, UserSearch, ArrowLeft } from "lucide-react";

export default function CustomerCouponsPage() {
  const navigate = useNavigate();

  const assignmentOptions = [
    {
      title: "Assign to Single Customer",
      description: "Assign a coupon to an individual customer by phone number",
      icon: UserSearch,
      path: "/coupons/customer/assign-single",
    },
    {
      title: "Bulk Assignment",
      description: "Assign coupons to multiple customers by phone numbers",
      icon: Users,
      path: "/coupons/customer/assign-bulk",
    },
    {
      title: "Segment-Based Assignment",
      description:
        "Target customer segments like inactive, high-value, or new customers",
      icon: UserPlus,
      path: "/coupons/customer/assign-segment",
    },
  ];

  const handleSearchCustomer = () => {
    navigate("/coupons/customer/search");
  };

  return (
    <MainView title="Customer Coupons">
      <div className="min-h-screen bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  Customer Coupons
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Assign personalized coupons to specific customers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/coupons")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total Assigned",
                value: "—",
                accent: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Active Assignments",
                value: "—",
                accent: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Customers with Coupons",
                value: "—",
                accent: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Expired Assignments",
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

          {/* Section Header */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Choose Assignment Method
            </h2>
            <p className="text-sm text-slate-500">
              Select how you want to assign customer coupons
            </p>
          </div>

          {/* Assignment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assignmentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.title}
                  onClick={() => navigate(option.path)}
                  className="group bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-200">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {option.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Customer Lookup Section */}
          <div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Customer Coupon Lookup
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Search for a customer to view their assigned coupons and
                    usage history
                  </p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
                  <UserSearch className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <button
                onClick={handleSearchCustomer}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200">
                <UserSearch className="h-4 w-4" />
                Search Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainView>
  );
}
