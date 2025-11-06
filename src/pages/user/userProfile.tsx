import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { User, Activity, History, Calendar } from "lucide-react";
import { getUserProfile } from "../../api/user";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import { UserProfileHeader } from "./components/UserProfileHeader";
import { UserInformationPanel } from "./components/UserInformationPanel";
import { UserPerformancePanel } from "./components/UserPerformancePanel";
import { UserActivityTimeline } from "./components/UserActivityTimeline";
import dayjs from "dayjs";
import { useAdminAudit } from "../../hooks/useAdminAudit";
import { UserPerformanceDetailResponse } from "../../api/adminAudit";

const ProfilePage = () => {
  const { fetchUserById } = useLoginAuth();
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    avatar: "",
    role: "",
    bio: "",
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
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4'>
        <div className='max-w-7xl mx-auto'>
          <Card className='h-64 animate-pulse bg-gray-200' />
        </div>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen md:rounded-2xl bg-gradient-to-br from-orange-50 via-rose-50 to-cyan-50 py-4 sm:py-8 px-4 w-full'>
      <div className='absolute md:rounded-t-2xl top-0 left-0 w-full h-40 md:h-[30%] bg-gradient-to-br from-cyan-400 via-orange-300 to-rose-400' />
      {/* Decorative background circles */}
      <div className='absolute top-10 left-10 w-32 h-32 sm:w-48 sm:h-48 bg-cyan-300 rounded-full mix-blend-overlay opacity-50' />
      <div className='absolute top-20 right-20 w-48 h-48 sm:w-64 sm:h-64 bg-rose-300 rounded-full mix-blend-overlay opacity-40' />
      <div className='absolute bottom-10 left-1/3 w-40 h-40 sm:w-56 sm:h-56 bg-cyan-200 rounded-full mix-blend-overlay opacity-30' />
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
          <TabsList className='h-11 grid w-full grid-cols-3 lg:w-auto lg:inline-grid gap-2 bg-white px-2 pt-2 pb-4 rounded-lg shadow-md'>
            <TabsTrigger
              value='information'
              className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white'>
              <User className='w-4 h-4' />
              <span className='hidden sm:inline'>Information</span>
            </TabsTrigger>
            <TabsTrigger
              value='performance'
              className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white'>
              <Activity className='w-4 h-4' />
              <span className='hidden sm:inline'>Performance</span>
            </TabsTrigger>
            <TabsTrigger
              value='activity'
              className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white'>
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
                <Card className='p-4 shadow-md bg-gradient-to-br from-white to-blue-50'>
                  <h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-blue-600' />
                    Date Range
                  </h3>
                  <div className='space-y-2'>
                    <div>
                      <label className='text-xs text-gray-600 block mb-1'>
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
                        className='w-full px-3 py-2 border rounded-md text-sm'
                      />
                    </div>
                    <div>
                      <label className='text-xs text-gray-600 block mb-1'>
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
                        className='w-full px-3 py-2 border rounded-md text-sm'
                      />
                    </div>
                  </div>
                </Card>

                {/* Account Info */}
                <Card className='p-4 shadow-md bg-gradient-to-br from-white to-purple-50'>
                  <h3 className='font-semibold text-gray-900 mb-3'>
                    Account Info
                  </h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Status:</span>
                      <span className='font-medium text-green-600'>Active</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Role:</span>
                      <span className='font-medium'>{profile.role}</span>
                    </div>
                    {profile.createdAt && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Joined:</span>
                        <span className='font-medium'>
                          {dayjs(profile.createdAt).format("MMM DD, YYYY")}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
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
                <Card className='p-4 shadow-md bg-gradient-to-br from-white to-green-50 sticky top-4'>
                  <h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-green-600' />
                    Filter Activities
                  </h3>
                  <div className='space-y-2'>
                    <div>
                      <label className='text-xs text-gray-600 block mb-1'>
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
                        className='w-full px-3 py-2 border rounded-md text-sm'
                      />
                    </div>
                    <div>
                      <label className='text-xs text-gray-600 block mb-1'>
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
                        className='w-full px-3 py-2 border rounded-md text-sm'
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
