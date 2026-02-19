import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Trash2, X, Filter } from 'lucide-react';
import { useBulkCommunication } from '../hooks/useBulkCommunication';
import { BulkMessageType, CampaignStatus, SMSCampaign, EmailCampaign, CampaignQueryParams } from '../interface';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

interface CampaignListProps {
  type: BulkMessageType;
}

const CampaignList = ({ type }: CampaignListProps) => {
  const navigate = useNavigate();
  const {
    campaigns,
    loading,
    fetchCampaigns,
    cancelCampaign,
    deleteCampaign,
  } = useBulkCommunication(type);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [campaignToCancel, setCampaignToCancel] = useState<SMSCampaign | EmailCampaign | null>(null);
  const [params, setParams] = useState<CampaignQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    fetchCampaigns(params);
  }, [fetchCampaigns, params]);

  const handleFilter = () => {
    const newParams: CampaignQueryParams = {
      ...params,
      status: statusFilter !== 'all' ? statusFilter as CampaignStatus : undefined,
      page: 1,
    };
    setParams(newParams);
    fetchCampaigns(newParams);
  };

  const handleReset = () => {
    setStatusFilter('all');
    setSearchQuery('');
    const newParams: CampaignQueryParams = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setParams(newParams);
    fetchCampaigns(newParams);
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/bulk-communication/${type}/${campaignId}`);
  };

  const handleCancelCampaign = async () => {
    if (!campaignToCancel) return;

    const success = await cancelCampaign(campaignToCancel.id);
    if (success) {
      setCampaignToCancel(null);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    const success = await deleteCampaign(campaignToDelete);
    if (success) {
      setCampaignToDelete(null);
    }
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'queued':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      case 'failed':
        return 'destructive';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredCampaigns = campaigns?.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading && !campaigns) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={handleFilter} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant="outline">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table divClass="relative">
              <TableHeader className="sticky top-0 bg-white border-b z-10">
                <TableRow className="bg-sidebar">
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell>
                      {campaign.totalRecipients.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{campaign.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.scheduledFor
                        ? format(new Date(campaign.scheduledFor), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(campaign.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCampaign(campaign.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {(campaign.status === 'queued' || campaign.status === 'processing') && (
                            <DropdownMenuItem
                              onClick={() => setCampaignToCancel(campaign)}
                              className="text-yellow-600"
                            >
                              Cancel Campaign
                            </DropdownMenuItem>
                          )}
                          {campaign.status !== 'processing' && (
                            <DropdownMenuItem
                              onClick={() => setCampaignToDelete(campaign.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCampaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {campaigns && campaigns.length > 0 && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((params.page || 1) - 1) * (params.limit || 20) + 1}-
                  {Math.min((params.page || 1) * (params.limit || 20), filteredCampaigns.length)}{' '}
                  of {filteredCampaigns.length} campaigns
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(params.page || 1) === 1}
                    onClick={() => {
                      const newParams: CampaignQueryParams = { ...params, page: (params.page || 1) - 1 };
                      setParams(newParams);
                      fetchCampaigns(newParams);
                    }}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">Page {params.page || 1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newParams: CampaignQueryParams = { ...params, page: (params.page || 1) + 1 };
                      setParams(newParams);
                      fetchCampaigns(newParams);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!campaignToCancel} onOpenChange={() => setCampaignToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{campaignToCancel?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelCampaign} className="bg-yellow-600">
              Yes, cancel it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!campaignToDelete} onOpenChange={() => setCampaignToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCampaign} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignList;
