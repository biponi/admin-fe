import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
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
import { useToast } from '../../../components/ui/use-toast';
import { useBulkCommunication } from '../hooks/useBulkCommunication';
import {
  StatusBadge,
  RecipientStatusBadge,
} from './shared';
import {
  ArrowLeft,
  RefreshCw,
  Ban,
  Users,
  Send,
  CheckCircle2,
  XCircle,
  Eye,
  MousePointerClick,
  Target,
  MessageSquare,
  Mail,
  Paperclip,
  Inbox,
  Activity,
} from 'lucide-react';
import { BulkMessageType } from '../interface';
import { format } from 'date-fns';

interface StatCardConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  ring: string;
  bar: string;
  value: string;
  pct: number;
}

const CAMPAIGN_TYPE_LABEL: Record<BulkMessageType, string> = {
  sms: 'SMS',
  email: 'Email',
};

const CampaignDetails = () => {
  const { type, campaignId } = useParams<{ type: BulkMessageType; campaignId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCampaign, loading, fetchCampaign, cancelCampaign } = useBulkCommunication(type || 'sms');

  const [refreshing, setRefreshing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

  const handleConfirmCancel = async () => {
    if (!selectedCampaign) return;
    const success = await cancelCampaign(selectedCampaign.id);
    if (success) {
      setShowCancelDialog(false);
      fetchCampaign(selectedCampaign.id);
    }
  };

  const isSMS = type === 'sms';
  const campaign = selectedCampaign as any;

  const total = campaign?.totalRecipients ?? 0;
  const sentCount = campaign?.sentCount ?? 0;
  const failedCount = campaign?.failedCount ?? 0;
  const deliveredCount = campaign?.deliveredCount ?? 0;
  const sentNotDelivered = Math.max(0, sentCount - deliveredCount);
  const pendingCount = Math.max(0, total - sentCount - failedCount);
  const pctOf = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const statCards: StatCardConfig[] = isSMS
    ? [
        {
          key: 'recipients',
          label: 'Recipients',
          description: 'Total audience',
          icon: Users,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          ring: 'ring-indigo-100',
          bar: 'bg-indigo-500',
          value: total.toLocaleString(),
          pct: 100,
        },
        {
          key: 'sent',
          label: 'Sent',
          description: 'Dispatched to gateway',
          icon: Send,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          ring: 'ring-blue-100',
          bar: 'bg-blue-500',
          value: sentCount.toLocaleString(),
          pct: pctOf(sentCount),
        },
        {
          key: 'delivered',
          label: 'Delivered',
          description: 'Confirmed handsets',
          icon: CheckCircle2,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          ring: 'ring-emerald-100',
          bar: 'bg-emerald-500',
          value: deliveredCount.toLocaleString(),
          pct: pctOf(deliveredCount),
        },
        {
          key: 'failed',
          label: 'Failed',
          description: 'After retries',
          icon: XCircle,
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          ring: 'ring-rose-100',
          bar: 'bg-rose-500',
          value: failedCount.toLocaleString(),
          pct: pctOf(failedCount),
        },
        {
          key: 'success',
          label: 'Success Rate',
          description: 'Sent successfully',
          icon: Target,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          ring: 'ring-emerald-100',
          bar: 'bg-emerald-500',
          value: `${campaign?.successRate ?? 0}%`,
          pct: Math.min(campaign?.successRate ?? 0, 100),
        },
      ]
    : [
        {
          key: 'recipients',
          label: 'Recipients',
          description: 'Total audience',
          icon: Users,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          ring: 'ring-indigo-100',
          bar: 'bg-indigo-500',
          value: total.toLocaleString(),
          pct: 100,
        },
        {
          key: 'sent',
          label: 'Sent',
          description: 'Dispatched to gateway',
          icon: Send,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          ring: 'ring-blue-100',
          bar: 'bg-blue-500',
          value: sentCount.toLocaleString(),
          pct: pctOf(sentCount),
        },
        {
          key: 'delivered',
          label: 'Delivered',
          description: 'Confirmed inboxes',
          icon: CheckCircle2,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          ring: 'ring-emerald-100',
          bar: 'bg-emerald-500',
          value: deliveredCount.toLocaleString(),
          pct: pctOf(deliveredCount),
        },
        {
          key: 'opened',
          label: 'Opened',
          description: `Open rate ${campaign?.openRate ?? 0}%`,
          icon: Eye,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          ring: 'ring-indigo-100',
          bar: 'bg-indigo-500',
          value: (campaign?.openedCount ?? 0).toLocaleString(),
          pct: pctOf(campaign?.openedCount ?? 0),
        },
        {
          key: 'clicked',
          label: 'Clicked',
          description: `Click rate ${campaign?.clickRate ?? 0}%`,
          icon: MousePointerClick,
          color: 'text-violet-600',
          bg: 'bg-violet-50',
          ring: 'ring-violet-100',
          bar: 'bg-violet-500',
          value: (campaign?.clickedCount ?? 0).toLocaleString(),
          pct: pctOf(campaign?.clickedCount ?? 0),
        },
      ];

  const timelineSteps = [
    {
      label: 'Created',
      date: campaign?.createdAt,
      reached: true,
      dotClass: 'bg-indigo-500',
    },
    {
      label: 'Scheduled',
      date: campaign?.scheduledFor,
      reached: Boolean(campaign?.scheduledFor),
      dotClass: 'bg-indigo-500',
    },
    {
      label: 'Started',
      date: campaign?.startedAt,
      reached: Boolean(campaign?.startedAt),
      dotClass: 'bg-indigo-500',
    },
    {
      label: 'Completed',
      date: campaign?.completedAt,
      reached: Boolean(campaign?.completedAt),
      dotClass:
        campaign?.status === 'completed'
          ? 'bg-emerald-500'
          : campaign?.status === 'failed'
          ? 'bg-rose-500'
          : campaign?.status === 'cancelled'
          ? 'bg-slate-400'
          : campaign?.status === 'processing'
          ? 'bg-amber-500 animate-pulse'
          : 'bg-slate-300',
    },
  ];

  const formatDateTime = (date?: string) =>
    date ? format(new Date(date), 'MMM d, yyyy · HH:mm') : '—';

  if (loading || !selectedCampaign) {
    return (
      <div className='min-h-screen bg-slate-50/60 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
          <p className='text-sm text-slate-500'>Loading campaign…</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(`/bulk-communication/${type}`)}
          className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors'>
          <ArrowLeft className='h-4 w-4' />
          Back to {CAMPAIGN_TYPE_LABEL[type || 'sms']} Campaigns
        </button>

        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
          <div className='flex items-start gap-3 min-w-0'>
            <div className='w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200 shrink-0'>
              {isSMS ? (
                <MessageSquare className='h-5 w-5 text-white' />
              ) : (
                <Mail className='h-5 w-5 text-white' />
              )}
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <h1 className='text-xl font-semibold text-slate-900 leading-tight truncate max-w-xl'>
                  {campaign.name}
                </h1>
                <StatusBadge status={campaign.status} />
                <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 uppercase'>
                  {CAMPAIGN_TYPE_LABEL[type || 'sms']}
                </span>
              </div>
              <p className='text-sm text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap'>
                <span>Created {formatDateTime(campaign.createdAt)}</span>
                {campaign.createdBy && (
                  <>
                    <span className='text-slate-300'>·</span>
                    <span>by {campaign.createdBy}</span>
                  </>
                )}
                <span className='text-slate-300'>·</span>
                <span className='font-mono text-xs'>{campaign.id}</span>
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            {campaign.status === 'queued' || campaign.status === 'processing' ? (
              <button
                onClick={() => setShowCancelDialog(true)}
                className='inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors shadow-sm'>
                <Ban className='h-3.5 w-3.5' />
                Cancel Campaign
              </button>
            ) : null}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className='inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50'>
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
          {statCards.map(
            ({ key, label, description, icon: Icon, color, bg, ring, bar, value, pct }) => (
              <div
                key={key}
                className='relative flex flex-col gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden'>
                {/* top row */}
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-slate-500'>{label}</span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} ring-2 ${ring}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                </div>
                {/* value */}
                <div>
                  <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                  <p className='text-xs text-slate-400 mt-0.5'>{description}</p>
                </div>
                {/* mini progress */}
                <div className='h-1 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className='text-[10px] text-slate-400 tabular-nums'>
                  {pct}% of total
                </span>
              </div>
            ),
          )}
        </div>

        {/* Email engagement summary */}
        {!isSMS && (
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {[
              {
                label: 'Open Rate',
                value: `${campaign.openRate ?? 0}%`,
                valueClass: 'text-indigo-600',
              },
              {
                label: 'Click Rate',
                value: `${campaign.clickRate ?? 0}%`,
                valueClass: 'text-violet-600',
              },
              {
                label: 'Success Rate',
                value: `${campaign.successRate ?? 0}%`,
                valueClass: 'text-emerald-600',
              },
            ].map(({ label, value, valueClass }) => (
              <div
                key={label}
                className='flex flex-col gap-1 px-4 py-3.5 bg-white rounded-xl border border-slate-100 shadow-sm'>
                <p className='text-xs text-slate-500'>{label}</p>
                <p className={`text-xl font-bold tabular-nums ${valueClass}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
          {/* Left column */}
          <div className='lg:col-span-2 space-y-5'>
            {/* Delivery progress */}
            <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <Activity className='h-4 w-4 text-slate-400' />
                  <h3 className='text-sm font-semibold text-slate-700'>Delivery Progress</h3>
                </div>
                <p className='text-2xl font-bold tabular-nums text-slate-900'>
                  {campaign.progress}%
                </p>
              </div>
              <div className='h-2.5 bg-slate-100 rounded-full overflow-hidden'>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    campaign.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                />
              </div>

              {/* Breakdown */}
              <div className='mt-5'>
                <div className='h-2 bg-slate-100 rounded-full overflow-hidden flex'>
                  <div
                    className='bg-emerald-500 transition-all duration-500'
                    style={{ width: `${pctOf(deliveredCount)}%` }}
                  />
                  <div
                    className='bg-blue-500 transition-all duration-500'
                    style={{ width: `${pctOf(sentNotDelivered)}%` }}
                  />
                  <div
                    className='bg-rose-500 transition-all duration-500'
                    style={{ width: `${pctOf(failedCount)}%` }}
                  />
                  <div
                    className='bg-slate-300 transition-all duration-500'
                    style={{ width: `${pctOf(pendingCount)}%` }}
                  />
                </div>
                <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2'>
                  {[
                    { label: 'Delivered', count: deliveredCount, dot: 'bg-emerald-500' },
                    { label: 'Sent (not delivered)', count: sentNotDelivered, dot: 'bg-blue-500' },
                    { label: 'Failed', count: failedCount, dot: 'bg-rose-500' },
                    { label: 'Pending', count: pendingCount, dot: 'bg-slate-300' },
                  ].map(({ label, count, dot }) => (
                    <div key={label} className='flex items-center gap-1.5 text-xs text-slate-500'>
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      <span className='tabular-nums'>{count.toLocaleString()}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Message preview */}
            <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5'>
              {isSMS ? (
                <>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-sm font-semibold text-slate-700'>Message</h3>
                    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'>
                      {campaign.message?.length ?? 0} chars ·{' '}
                      {Math.ceil((campaign.message?.length ?? 0) / 160)} segment(s)
                    </span>
                  </div>
                  <div className='bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed'>
                    {campaign.message}
                  </div>
                </>
              ) : (
                <>
                  <h3 className='text-sm font-semibold text-slate-700 mb-2'>Subject</h3>
                  <p className='text-sm font-semibold text-slate-900'>{campaign.subject}</p>
                  <h3 className='text-sm font-semibold text-slate-700 mt-4 mb-2'>Preview</h3>
                  {campaign.text ? (
                    <div className='bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed'>
                      {campaign.text}
                    </div>
                  ) : (
                    <div
                      className='bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 [&_img]:max-w-full'
                      dangerouslySetInnerHTML={{ __html: campaign.html || '' }}
                    />
                  )}
                  {campaign.attachments && campaign.attachments.length > 0 && (
                    <div className='mt-4'>
                      <h4 className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5'>
                        <Paperclip className='h-3.5 w-3.5' />
                        Attachments ({campaign.attachments.length})
                      </h4>
                      <div className='space-y-1.5'>
                        {campaign.attachments.map(
                          (attachment: any, index: number) => (
                            <div
                              key={index}
                              className='flex items-center gap-2 text-sm text-slate-600'>
                              <Paperclip className='h-3.5 w-3.5 text-slate-400' />
                              <span className='truncate'>{attachment.filename}</span>
                              {attachment.contentType && (
                                <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200'>
                                  {attachment.contentType}
                                </span>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Recipients table */}
            <div className='rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden'>
              <div className='flex items-center justify-between px-4 py-3.5 border-b border-slate-100'>
                <div className='flex items-center gap-2'>
                  <Users className='h-3.5 w-3.5 text-slate-500' />
                  <h3 className='text-sm font-semibold text-slate-800'>Recipients</h3>
                  <span className='text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-100 tabular-nums'>
                    {(campaign.recipients?.length ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <Table divClass='relative max-h-[600px] overflow-y-auto'>
                <TableHeader className='sticky top-0 z-10 bg-slate-50 [&_tr]:border-b [&_tr:hover]:bg-slate-50'>
                  <TableRow>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      {isSMS ? 'Phone Number' : 'Email'}
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Status
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Attempts
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Sent At
                    </TableHead>
                    {!isSMS && (
                      <>
                        <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                          Opened At
                        </TableHead>
                        <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                          Clicked At
                        </TableHead>
                      </>
                    )}
                    {isSMS && (
                      <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                        Delivered At
                      </TableHead>
                    )}
                    <TableHead className='text-xs font-semibold text-slate-500 uppercase tracking-wide py-3'>
                      Reason
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.recipients?.map((recipient: any, index: number) => (
                    <TableRow
                      key={index}
                      className='border-b border-slate-50 hover:bg-slate-50/60 transition-colors'>
                      <TableCell className='py-3.5 font-mono text-sm text-slate-700 whitespace-nowrap'>
                        {isSMS ? recipient.phoneNumber : recipient.email}
                      </TableCell>
                      <TableCell className='py-3.5'>
                        <RecipientStatusBadge status={recipient.status} />
                      </TableCell>
                      <TableCell className='py-3.5 text-sm text-slate-600 tabular-nums'>
                        {recipient.attempts || 0}
                      </TableCell>
                      <TableCell className='py-3.5 text-sm text-slate-500 whitespace-nowrap'>
                        {recipient.sentAt
                          ? format(new Date(recipient.sentAt), 'MMM d, HH:mm')
                          : <span className='text-slate-300'>—</span>}
                      </TableCell>
                      {!isSMS && (
                        <>
                          <TableCell className='py-3.5 text-sm text-slate-500 whitespace-nowrap'>
                            {recipient.openedAt
                              ? format(new Date(recipient.openedAt), 'MMM d, HH:mm')
                              : <span className='text-slate-300'>—</span>}
                          </TableCell>
                          <TableCell className='py-3.5 text-sm text-slate-500 whitespace-nowrap'>
                            {recipient.clickedAt
                              ? format(new Date(recipient.clickedAt), 'MMM d, HH:mm')
                              : <span className='text-slate-300'>—</span>}
                          </TableCell>
                        </>
                      )}
                      {isSMS && (
                        <TableCell className='py-3.5 text-sm text-slate-500 whitespace-nowrap'>
                          {recipient.deliveredAt
                            ? format(new Date(recipient.deliveredAt), 'MMM d, HH:mm')
                            : <span className='text-slate-300'>—</span>}
                        </TableCell>
                      )}
                      <TableCell className='py-3.5 max-w-[220px]'>
                        {recipient.failedReason ? (
                          <span
                            title={recipient.failedReason}
                            className='block truncate text-rose-600 text-xs'>
                            {recipient.failedReason}
                          </span>
                        ) : (
                          <span className='text-slate-300 text-sm'>—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!campaign.recipients || campaign.recipients.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={isSMS ? 6 : 7}
                        className='py-16 text-center'>
                        <div className='flex flex-col items-center gap-2 text-slate-400'>
                          <Inbox className='h-8 w-8 opacity-40' />
                          <p className='text-sm font-medium'>No recipients yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right column */}
          <div className='lg:col-span-1 space-y-5'>
            {/* Campaign information */}
            <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4'>
              <h3 className='text-sm font-semibold text-slate-700'>Campaign Information</h3>
              <dl className='grid grid-cols-2 gap-x-4 gap-y-3'>
                <div>
                  <dt className='text-xs text-slate-400'>Campaign ID</dt>
                  <dd className='font-mono text-xs text-slate-600 break-all mt-0.5'>
                    {campaign.id}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs text-slate-400'>Created</dt>
                  <dd className='text-sm text-slate-700 tabular-nums mt-0.5'>
                    {formatDateTime(campaign.createdAt)}
                  </dd>
                </div>
                {campaign.scheduledFor && (
                  <div>
                    <dt className='text-xs text-slate-400'>Scheduled For</dt>
                    <dd className='text-sm text-slate-700 tabular-nums mt-0.5'>
                      {formatDateTime(campaign.scheduledFor)}
                    </dd>
                  </div>
                )}
                {campaign.startedAt && (
                  <div>
                    <dt className='text-xs text-slate-400'>Started At</dt>
                    <dd className='text-sm text-slate-700 tabular-nums mt-0.5'>
                      {formatDateTime(campaign.startedAt)}
                    </dd>
                  </div>
                )}
                {campaign.completedAt && (
                  <div>
                    <dt className='text-xs text-slate-400'>Completed At</dt>
                    <dd className='text-sm text-slate-700 tabular-nums mt-0.5'>
                      {formatDateTime(campaign.completedAt)}
                    </dd>
                  </div>
                )}
                {campaign.createdBy && (
                  <div>
                    <dt className='text-xs text-slate-400'>Created By</dt>
                    <dd className='text-sm text-slate-700 mt-0.5'>{campaign.createdBy}</dd>
                  </div>
                )}
                <div>
                  <dt className='text-xs text-slate-400'>Total Recipients</dt>
                  <dd className='text-sm text-slate-700 tabular-nums mt-0.5'>
                    {total.toLocaleString()}
                  </dd>
                </div>
              </dl>

              {campaign.tags && campaign.tags.length > 0 && (
                <div>
                  <dt className='text-xs text-slate-400 mb-1.5'>Tags</dt>
                  <div className='flex gap-1.5 flex-wrap'>
                    {campaign.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className='px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 ring-1 ring-slate-200'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {campaign.metadata && Object.keys(campaign.metadata).length > 0 && (
                <div>
                  <p className='text-xs text-slate-400 mb-1.5'>Metadata</p>
                  <div className='bg-slate-50/60 rounded-lg p-3 space-y-1.5'>
                    {Object.entries(campaign.metadata).map(([key, value]) => (
                      <div key={key} className='flex items-start justify-between gap-3'>
                        <span className='font-mono text-xs text-slate-500'>{key}</span>
                        <span className='text-xs text-slate-700 text-right break-all'>
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5'>
              <h3 className='text-sm font-semibold text-slate-700 mb-4'>Timeline</h3>
              <ul className='space-y-0'>
                {timelineSteps.map((step, index) => (
                  <li key={step.label} className='relative flex gap-3 pb-5 last:pb-0'>
                    {index < timelineSteps.length - 1 && (
                      <span className='absolute left-[4.5px] top-4 bottom-0 w-px bg-slate-200' />
                    )}
                    <span
                      className={`relative z-10 w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${
                        step.reached
                          ? step.dotClass
                          : 'bg-white ring-2 ring-slate-200'
                      }`}
                    />
                    <div className='min-w-0'>
                      <p
                        className={`text-xs font-medium ${
                          step.reached ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                        {step.label}
                      </p>
                      <p
                        className={`text-xs tabular-nums mt-0.5 ${
                          step.reached && step.date ? 'text-slate-400' : 'text-slate-300'
                        }`}>
                        {step.date ? formatDateTime(step.date) : '—'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirmation */}
      <AlertDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{campaign.name}&quot; will stop sending. Messages already
              delivered won&apos;t be recalled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='text-sm'>
              Keep running
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className='bg-amber-500 hover:bg-amber-600 text-sm'>
              Yes, cancel it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignDetails;
