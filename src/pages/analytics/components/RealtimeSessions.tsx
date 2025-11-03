import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { RealtimeResponse, RealtimeSession } from "../../../api/analytics";
import { Activity, MapPin, Monitor, Globe } from "lucide-react";

interface RealtimeSessionsProps {
  data: RealtimeResponse;
}

const RealtimeSessions: React.FC<RealtimeSessionsProps> = ({ data }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  const getDeviceBadgeColor = (device: string) => {
    const colors: Record<string, string> = {
      desktop: "bg-blue-500",
      mobile: "bg-green-500",
      tablet: "bg-purple-500",
    };
    return (
      colors[
        !!device && typeof device === "string"
          ? device.toLowerCase()
          : "bg-gray-500"
      ] || "bg-gray-500"
    );
  };

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {/* Live Sessions */}
      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5 text-green-500 animate-pulse' />
            Live Sessions
          </CardTitle>
          <CardDescription>Active users in the last 30 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4 p-4 bg-muted rounded-lg'>
            <p className='text-sm text-muted-foreground'>Active Users</p>
            <p className='text-4xl font-bold text-green-600'>
              {data.activeUsers}
            </p>
          </div>

          <div className='space-y-3 max-h-[500px] overflow-y-auto'>
            {data.sessions.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No active sessions
              </div>
            ) : (
              data.sessions.map((session: RealtimeSession, index: number) => (
                <div
                  key={index}
                  className='flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Badge
                        className={`${getDeviceBadgeColor(
                          session.device
                        )} text-white`}>
                        {session.device}
                      </Badge>
                      <span className='text-sm text-muted-foreground'>
                        {session.browser}
                      </span>
                    </div>
                    <div className='flex items-center gap-3 mt-2 text-xs text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {session.city}, {session.country}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Monitor className='h-3 w-3' />
                        {session.pageViews} page views
                      </span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-muted-foreground'>
                      {formatTime(session.startedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages & Countries */}
      <div className='space-y-4'>
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {!data?.topPages
                ? ""
                : data?.topPages.slice(0, 5).map((page: any, index: number) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-2 rounded hover:bg-muted'>
                      <span className='text-sm truncate flex-1 mr-2'>
                        {page.pagePath}
                      </span>
                      <Badge variant='secondary'>{page.views}</Badge>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Globe className='h-4 w-4' />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {!data?.topCountries
                ? ""
                : data.topCountries.map((country: any, index: number) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-2 rounded hover:bg-muted'>
                      <span className='text-sm font-medium'>
                        {country.country}
                      </span>
                      <Badge variant='outline'>{country.users} users</Badge>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealtimeSessions;
