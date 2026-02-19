import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Ticket, Users, BarChart3, Plus } from "lucide-react";

export default function CouponDashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Global Coupons",
      description: "Create and manage public coupons available to all customers",
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/coupons/global",
      stats: "Manage universal discounts",
    },
    {
      title: "Customer Coupons",
      description: "Assign personalized coupons to individual customers or segments",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/coupons/customer",
      stats: "Target specific customers",
    },
    {
      title: "Analytics",
      description: "View usage statistics, customer segments, and performance metrics",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/coupons/analytics",
      stats: "Track performance",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and track coupons for your customers
          </p>
        </div>
        <Button
          onClick={() => navigate("/coupons/global/create")}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.stats}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">1. Create Global Coupon</h3>
              <p className="text-sm text-muted-foreground">
                Set up public coupons with discount codes that any customer can use at checkout
              </p>
            </div>
            <div className="flex-1 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2">2. Assign Customer Coupons</h3>
              <p className="text-sm text-muted-foreground">
                Target specific customers or segments with personalized discount offers
              </p>
            </div>
            <div className="flex-1 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">3. Track Performance</h3>
              <p className="text-sm text-muted-foreground">
                Monitor coupon usage, customer segments, and ROI through analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
