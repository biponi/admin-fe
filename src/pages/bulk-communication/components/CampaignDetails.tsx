import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { useToast } from '../../../components/ui/use-toast';
import { useBulkCommunication } from '../hooks/useBulkCommunication';
import { ArrowLeft, RefreshCw, Clock, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BulkMessageType } from '../interface';
import { format } from 'date-fns';

const CampaignDetails = () => {
  const { type, campaignId } = useParams<{ type: BulkMessageType; campaignId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCampaign, loading, fetchCampaign, cancelCampaign } = useBulkCommunication(type || 'sms');

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign(campaignId);
    }
  }, [campaignId, type, fetchCampaign]);

  const handleRefresh = async () => {
    if (!campaignId) return;
    setRefreshing(true);
    await fetchCampaign(campaignId);
    setRefreshing(false);
    toast({
      title: 'Success',
      description: 'Campaign data refreshed',
    });
  };

  const handleCancel = async () => {
    if (!selectedCampaign) return;
    const success = await cancelCampaign(selectedCampaign.id);
    if (success) {
      fetchCampaign(selectedCampaign.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'queued':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'cancelled':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading || !selectedCampaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  const isSMS = type === 'sms';
  const campaign = selectedCampaign as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/bulk-communication/${type}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
        </div>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex items-center mt-1">
                  {getStatusIcon(campaign.status)}
                  <span className="ml-2 font-semibold capitalize">{campaign.status}</span>
                </div>
              </div>
              <Badge variant={getStatusColor(campaign.status)} className="ml-2">
                {campaign.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="text-2xl font-bold mt-1">{campaign.progress}%</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sent</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {campaign.sentCount || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {campaign.failedCount || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Information */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Campaign ID</p>
              <p className="font-mono text-sm mt-1">{campaign.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-sm mt-1">{format(new Date(campaign.createdAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            {campaign.scheduledFor && (
              <div>
                <p className="text-sm text-gray-500">Scheduled For</p>
                <p className="text-sm mt-1">{format(new Date(campaign.scheduledFor), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            )}
            {campaign.startedAt && (
              <div>
                <p className="text-sm text-gray-500">Started At</p>
                <p className="text-sm mt-1">{format(new Date(campaign.startedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            )}
            {campaign.completedAt && (
              <div>
                <p className="text-sm text-gray-500">Completed At</p>
                <p className="text-sm mt-1">{format(new Date(campaign.completedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            )}
            {isSMS && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Message</p>
                <p className="text-sm mt-1 bg-gray-50 p-3 rounded">{campaign.message}</p>
              </div>
            )}
            {!isSMS && (
              <>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="text-sm mt-1 font-semibold">{campaign.subject}</p>
                </div>
                {campaign.openRate !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Open Rate</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">{campaign.openRate}%</p>
                  </div>
                )}
                {campaign.clickRate !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Click Rate</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{campaign.clickRate}%</p>
                  </div>
                )}
              </>
            )}
          </div>

          {(campaign.status === 'queued' || campaign.status === 'processing') && (
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                onClick={handleCancel}
              >
                Cancel Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipients and Details Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="recipients" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="recipients" className="p-6">
              <div className="max-h-[600px] overflow-y-auto">
                <Table divClass="relative">
                  <TableHeader className="sticky top-0 bg-white border-b z-10">
                    <TableRow className="bg-sidebar">
                      <TableHead>{isSMS ? 'Phone Number' : 'Email'}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Sent At</TableHead>
                      {!isSMS && (
                        <>
                          <TableHead>Opened At</TableHead>
                          <TableHead>Clicked At</TableHead>
                        </>
                      )}
                      {isSMS && <TableHead>Delivered At</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.recipients?.map((recipient: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">
                          {isSMS ? recipient.phoneNumber : recipient.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={recipient.status === 'sent' || recipient.status === 'delivered'
                              ? 'default'
                              : recipient.status === 'failed'
                              ? 'destructive'
                              : 'secondary'}
                          >
                            {recipient.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{recipient.attempts || 0}</TableCell>
                        <TableCell>
                          {recipient.sentAt
                            ? format(new Date(recipient.sentAt), 'MMM dd, HH:mm')
                            : '-'}
                        </TableCell>
                        {!isSMS && (
                          <>
                            <TableCell>
                              {recipient.openedAt
                                ? format(new Date(recipient.openedAt), 'MMM dd, HH:mm')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {recipient.clickedAt
                                ? format(new Date(recipient.clickedAt), 'MMM dd, HH:mm')
                                : '-'}
                            </TableCell>
                          </>
                        )}
                        {isSMS && (
                          <TableCell>
                            {recipient.deliveredAt
                              ? format(new Date(recipient.deliveredAt), 'MMM dd, HH:mm')
                              : '-'}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {(!campaign.recipients || campaign.recipients.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={isSMS ? 5 : 6}
                          className="text-center py-8 text-gray-500"
                        >
                          No recipients found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="details" className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Recipients</p>
                    <p className="text-lg font-semibold">{campaign.totalRecipients}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-lg font-semibold text-green-600">
                      {campaign.successRate || 0}%
                    </p>
                  </div>
                  {campaign.deliveredCount !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Delivered</p>
                      <p className="text-lg font-semibold">{campaign.deliveredCount}</p>
                    </div>
                  )}
                  {!isSMS && campaign.openedCount !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Opened</p>
                      <p className="text-lg font-semibold">{campaign.openedCount}</p>
                    </div>
                  )}
                  {!isSMS && campaign.clickedCount !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Clicked</p>
                      <p className="text-lg font-semibold">{campaign.clickedCount}</p>
                    </div>
                  )}
                </div>

                {campaign.tags && campaign.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex gap-2 flex-wrap">
                      {campaign.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {campaign.metadata && Object.keys(campaign.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Metadata</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(campaign.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDetails;
