import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { useBulkCommunication } from '../hooks/useBulkCommunication';
import { BulkMessageType } from '../interface';

interface QueueStatsProps {
  type: BulkMessageType;
}

const QueueStats = ({ type }: QueueStatsProps) => {
  const { queueStats, fetchQueueStats } = useBulkCommunication(type);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQueueStats();
  }, [fetchQueueStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQueueStats();
    setRefreshing(false);
  };

  if (!queueStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading queue statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Queue Statistics</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">
                  Waiting
                </p>
                <p className="text-3xl font-bold text-blue-700 mt-2">{queueStats.waiting}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-700 mt-2">{queueStats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-semibold uppercase tracking-wide">
                  Active
                </p>
                <p className="text-3xl font-bold text-yellow-700 mt-2">{queueStats.active}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Loader className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-semibold uppercase tracking-wide">
                  Failed
                </p>
                <p className="text-3xl font-bold text-red-700 mt-2">{queueStats.failed}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">
                  Delayed
                </p>
                <p className="text-3xl font-bold text-purple-700 mt-2">{queueStats.delayed}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{queueStats.total}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {queueStats.total > 0
                  ? ((queueStats.completed / queueStats.total) * 100).toFixed(1)
                  : '0.0'}
                %
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Failure Rate</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {queueStats.total > 0
                  ? ((queueStats.failed / queueStats.total) * 100).toFixed(1)
                  : '0.0'}
                %
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {queueStats.waiting + queueStats.active + queueStats.delayed}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">About Queue Statistics</h4>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• <strong>Waiting:</strong> Jobs waiting to be processed</li>
                <li>• <strong>Active:</strong> Jobs currently being processed</li>
                <li>• <strong>Completed:</strong> Jobs successfully processed</li>
                <li>• <strong>Failed:</strong> Jobs that failed after 3 retry attempts</li>
                <li>• <strong>Delayed:</strong> Jobs delayed for retry (exponential backoff)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueStats;
