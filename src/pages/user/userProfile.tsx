import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { User, Activity, History, Calendar, DollarSign } from "lucide-react";
import { getUserProfile } from "../../api/user";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { UserProfileHeader } from "./components/UserProfileHeader";
import { UserInformationPanel } from "./components/UserInformationPanel";
import { UserPerformancePanel } from "./components/UserPerformancePanel";
import { UserActivityTimeline } from "./components/UserActivityTimeline";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAdminAudit } from "../../hooks/useAdminAudit";
import { UserPerformanceDetailResponse } from "../../api/adminAudit";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { fetchUserById } = useLoginAuth();
  const { hasRequiredPermission } = useRoleCheck();
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    avatar: "",
    role: "",
    bio: "",
    mobile_number: "",
    whatsapp_number: "",
    createdAt: "",
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const [isLoadingProfile, setIsLoading] = useState(true);

  const { fetchUserDetail, isLoading, error } = useAdminAudit();
  const [userDetail, setUserDetail] =
    useState<UserPerformanceDetailResponse | null>(null);

  useEffect(() => {
    if (profile?.id) {
      loadUserDetail();
    }
    // eslint-disable-next-line
  }, [profile?.id, dateRange?.startDate, dateRange?.endDate]);

  const loadUserDetail = async () => {
    const data = await fetchUserDetail(profile?.id, {
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
    });

    if (data) {
      setUserDetail(data);
    }
  };

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
    //eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    const response = await getUserProfile();
    if (response.success) {
      setProfile(response.data);
    } else {
      toast.error(response.error || "Failed to fetch profile");
    }
    setIsLoading(false);
  };

  const handleProfileUpdate = async () => {
    await fetchProfile();
    if (profile.id) {
      const userId = parseInt(profile.id);
      if (!isNaN(userId)) {
        fetchUserById(userId);
      }
    }
  };

  if (isLoadingProfile) {
    return (
      <div className='min-h-screen bg-slate-50/60 py-8 px-4'>
        <div className='max-w-7xl mx-auto'>
          <Card className='h-64 animate-pulse bg-slate-100' />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50/60 py-4 sm:py-8 px-4 w-full'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Profile Header */}
        <Card className='shadow-none bg-transparent border-0 mt-6 md:mt-0'>
          <UserProfileHeader
            name={profile.name}
            email={profile.email}
            avatar={profile.avatar}
            role={profile.role}
            phoneNumber={profile?.whatsapp_number ?? "NOT AVAILABLE"}
            userDetail={userDetail}
            joinedDate={profile.createdAt}
          />
        </Card>

        {/* Main Content - Tabs */}
        <Tabs defaultValue='information' className='w-full'>
          <TabsList className='h-11 grid w-full grid-cols-3 lg:w-auto lg:inline-grid gap-2 bg-slate-100/80 p-1 rounded-xl'>
            <TabsTrigger
              value='information'
              className='flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all duration-150 rounded-lg'>
              <User className='w-4 h-4' />
              <span className='hidden sm:inline'>Information</span>
            </TabsTrigger>
            <TabsTrigger
              value='performance'
              className='flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all duration-150 rounded-lg'>
              <Activity className='w-4 h-4' />
              <span className='hidden sm:inline'>Performance</span>
            </TabsTrigger>
            <TabsTrigger
              value='activity'
              className='flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all duration-150 rounded-lg'>
              <History className='w-4 h-4' />
              <span className='hidden sm:inline'>Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value='information' className='mt-6'>
            <div className='grid gap-6 lg:grid-cols-3'>
              {/* Main Information Panel - Takes 2 columns */}
              <div className='lg:col-span-2'>
                <UserInformationPanel
                  profile={profile}
                  onProfileUpdate={handleProfileUpdate}
                />
              </div>

              {/* Quick Stats Sidebar */}
              <div className='space-y-6'>
                {/* Date Range Selector */}
                <Card className='p-4 border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
                  <h3 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-indigo-600' />
                    Date Range
                  </h3>
                  <div className='space-y-2'>
                    <div>
                      <label className='text-xs text-slate-600 block mb-1'>
                        From
                      </label>
                      <input
                        type='date'
                        value={dayjs(dateRange.startDate).format("YYYY-MM-DD")}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            startDate: new Date(e.target.value).toISOString(),
                          })
                        }
                        className='w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-300 focus:ring-indigo-100'
                      />
                    </div>
                    <div>
                      <label className='text-xs text-slate-600 block mb-1'>
                        To
                      </label>
                      <input
                        type='date'
                        value={dayjs(dateRange.endDate).format("YYYY-MM-DD")}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            endDate: dayjs(e.target.value)
                              .endOf("day")
                              .toISOString(),
                          })
                        }
                        className='w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-300 focus:ring-indigo-100'
                      />
                    </div>
                  </div>
                </Card>

                {/* Account Info */}
                <Card className='p-4 border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
                  <h3 className='font-semibold text-slate-900 mb-3'>
                    Account Info
                  </h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Status:</span>
                      <span className='font-medium text-emerald-600'>Active</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Role:</span>
                      <span className='font-medium text-slate-900'>{profile.role}</span>
                    </div>
                    {profile.createdAt && (
                      <div className='flex justify-between'>
                        <span className='text-slate-600'>Joined:</span>
                        <span className='font-medium text-slate-900'>
                          {dayjs(profile.createdAt).format("MMM DD, YYYY")}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Commission Button */}
                {hasRequiredPermission("commission", "personal_access") && (
                  <Card className='p-4 border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
                    <h3 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                      <DollarSign className='w-4 h-4 text-emerald-600' />
                      Commissions
                    </h3>
                    <Button
                      onClick={() => navigate(`/my-commissions`)}
                      className='w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all duration-150'>
                      View My Commissions
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value='performance' className='mt-6'>
            {profile.id ? (
              <UserPerformancePanel
                isLoading={isLoading}
                userDetail={userDetail}
                error={error}
              />
            ) : (
              <Card className='p-8 text-center'>
                <p className='text-gray-500'>Loading performance data...</p>
              </Card>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value='activity' className='mt-6'>
            <div className='grid gap-6 lg:grid-cols-3'>
              {/* Activity Timeline - Takes 2 columns */}
              <div className='lg:col-span-2'>
                {profile.id ? (
                  <UserActivityTimeline
                    userId={profile.id}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                  />
                ) : (
                  <Card className='p-8 text-center'>
                    <p className='text-gray-500'>Loading activity data...</p>
                  </Card>
                )}
              </div>

              {/* Date Range Selector - Repeated for convenience */}
              <div>
                <Card className='p-4 border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sticky top-4'>
                  <h3 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-emerald-600' />
                    Filter Activities
                  </h3>
                  <div className='space-y-2'>
                    <div>
                      <label className='text-xs text-slate-600 block mb-1'>
                        From
                      </label>
                      <input
                        type='date'
                        value={dayjs(dateRange.startDate).format("YYYY-MM-DD")}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            startDate: new Date(e.target.value).toISOString(),
                          })
                        }
                        className='w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-300 focus:ring-indigo-100'
                      />
                    </div>
                    <div>
                      <label className='text-xs text-slate-600 block mb-1'>
                        To
                      </label>
                      <input
                        type='date'
                        value={dayjs(dateRange.endDate).format("YYYY-MM-DD")}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            endDate: dayjs(e.target.value)
                              .endOf("day")
                              .toISOString(),
                          })
                        }
                        className='w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-300 focus:ring-indigo-100'
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
