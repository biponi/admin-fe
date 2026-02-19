import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { UserPlus, Users, UserSearch } from "lucide-react";

export default function CustomerCouponsPage() {
  const navigate = useNavigate();

  const assignmentOptions = [
    {
      title: "Assign to Single Customer",
      description: "Assign a coupon to an individual customer by phone number",
      icon: UserSearch,
      path: "/coupons/customer/assign-single",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Bulk Assignment",
      description: "Assign coupons to multiple customers by phone numbers",
      icon: Users,
      path: "/coupons/customer/assign-bulk",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Segment-Based Assignment",
      description:
        "Target customer segments like inactive, high-value, or new customers",
      icon: UserPlus,
      path: "/coupons/customer/assign-segment",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Customer Coupons
          </h1>
          <p className='text-muted-foreground mt-2'>
            Assign personalized coupons to specific customers
          </p>
        </div>
        <Button onClick={() => navigate("/coupons")} variant='outline'>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Assignment Method</CardTitle>
          <CardDescription>
            Select how you want to assign customer coupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {assignmentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.title}
                  className='cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary'
                  onClick={() => navigate(option.path)}>
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${option.color}`} />
                    </div>
                    <CardTitle className='text-lg'>{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Coupon Management</CardTitle>
          <CardDescription>
            View and manage all assigned customer coupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='view'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='view'>View Customer Coupons</TabsTrigger>
              <TabsTrigger value='search'>Search by Phone</TabsTrigger>
            </TabsList>
            <TabsContent value='view' className='space-y-4'>
              <div className='text-center py-8 text-muted-foreground'>
                <Users className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <p>Select a customer phone number to view their coupons</p>
                <Button
                  className='mt-4'
                  onClick={() => navigate("/coupons/customer/search")}>
                  Search Customer
                </Button>
              </div>
            </TabsContent>
            <TabsContent value='search' className='space-y-4'>
              <div className='text-center py-8 text-muted-foreground'>
                <UserSearch className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <p>
                  Search for a customer by phone number to see their assigned
                  coupons
                </p>
                <Button
                  className='mt-4'
                  onClick={() => navigate("/coupons/customer/search")}>
                  Search Now
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <h3 className='font-semibold mb-2'>Single Assignment</h3>
              <p className='text-sm text-muted-foreground'>
                Best for: VIP customers, compensations, personalized offers
              </p>
            </div>
            <div className='p-4 bg-green-50 rounded-lg'>
              <h3 className='font-semibold mb-2'>Bulk Assignment</h3>
              <p className='text-sm text-muted-foreground'>
                Best for: Multiple customers at once, manual phone lists
              </p>
            </div>
            <div className='p-4 bg-purple-50 rounded-lg'>
              <h3 className='font-semibold mb-2'>Segment Assignment</h3>
              <p className='text-sm text-muted-foreground'>
                Best for: Marketing campaigns, re-engagement, promotions
              </p>
            </div>
            <div className='p-4 bg-orange-50 rounded-lg'>
              <h3 className='font-semibold mb-2'>Customer Lookup</h3>
              <p className='text-sm text-muted-foreground'>
                Best for: Viewing customer coupons, usage history, management
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
