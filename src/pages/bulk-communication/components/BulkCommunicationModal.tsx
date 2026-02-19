import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { MessageSquare, Mail, Send, Loader2 } from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';

interface BulkCommunicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Array<{ name: string; phone?: string; email?: string }>;
  productId?: string;
  productName?: string;
}

const BulkCommunicationModal = ({
  open,
  onOpenChange,
  customers,
  productId,
  productName,
}: BulkCommunicationModalProps) => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [loading, setLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // SMS Form State
  const [smsName, setSmsName] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsScheduledFor, setSmsScheduledFor] = useState('');

  // Email Form State
  const [emailName, setEmailName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailHtml, setEmailHtml] = useState('');
  const [emailText, setEmailText] = useState('');
  const [emailScheduledFor, setEmailScheduledFor] = useState('');

  // Filter valid recipients
  const smsRecipients = customers
    .map(c => c.phone)
    .filter((phone): phone is string => !!phone);

  const emailRecipients = customers
    .map(c => c.email)
    .filter((email): email is string => !!email);

  const handleSendSMS = async () => {
    if (!smsName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Campaign name is required',
      });
      return;
    }

    if (!smsMessage.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Message is required',
      });
      return;
    }

    if (smsMessage.length > 160) {
      toast({
        variant: 'destructive',
        title: 'Message Too Long',
        description: `SMS message is ${smsMessage.length} characters. Maximum is 160.`,
      });
      return;
    }

    if (smsRecipients.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Recipients',
        description: 'No customers with phone numbers found',
      });
      return;
    }

    if (isScheduling && !smsScheduledFor) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Scheduled date and time is required',
      });
      return;
    }

    if (isScheduling && new Date(smsScheduledFor) <= new Date()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Scheduled time must be in the future',
      });
      return;
    }

    setLoading(true);

    const campaignData = {
      name: smsName,
      message: smsMessage,
      recipients: smsRecipients,
      scheduledFor: isScheduling ? smsScheduledFor : undefined,
      metadata: {
        source: 'product_details',
        productId,
        productName,
        customerCount: smsRecipients.length,
      },
    };

    const response = await fetch('/api/v1/bulk-sms/campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(campaignData),
    });

    const result = await response.json();
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Success',
        description: `SMS campaign created for ${smsRecipients.length} recipients`,
      });
      onOpenChange(false);
      // Reset form
      setSmsName('');
      setSmsMessage('');
      setSmsScheduledFor('');
      setIsScheduling(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message || 'Failed to create SMS campaign',
      });
    }
  };

  const handleSendEmail = async () => {
    if (!emailName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Campaign name is required',
      });
      return;
    }

    if (!emailSubject.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Subject is required',
      });
      return;
    }

    if (!emailHtml.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Email content is required',
      });
      return;
    }

    if (emailRecipients.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Recipients',
        description: 'No customers with email addresses found',
      });
      return;
    }

    if (isScheduling && !emailScheduledFor) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Scheduled date and time is required',
      });
      return;
    }

    if (isScheduling && new Date(emailScheduledFor) <= new Date()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Scheduled time must be in the future',
      });
      return;
    }

    setLoading(true);

    const campaignData = {
      name: emailName,
      subject: emailSubject,
      html: emailHtml,
      text: emailText || undefined,
      recipients: emailRecipients,
      scheduledFor: isScheduling ? emailScheduledFor : undefined,
      metadata: {
        source: 'product_details',
        productId,
        productName,
        customerCount: emailRecipients.length,
      },
    };

    const response = await fetch('/api/v1/bulk-email/campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(campaignData),
    });

    const result = await response.json();
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Success',
        description: `Email campaign created for ${emailRecipients.length} recipients`,
      });
      onOpenChange(false);
      // Reset form
      setEmailName('');
      setEmailSubject('');
      setEmailHtml('');
      setEmailText('');
      setEmailScheduledFor('');
      setIsScheduling(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message || 'Failed to create email campaign',
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset forms after delay
    setTimeout(() => {
      setSmsName('');
      setSmsMessage('');
      setSmsScheduledFor('');
      setEmailName('');
      setEmailSubject('');
      setEmailHtml('');
      setEmailText('');
      setEmailScheduledFor('');
      setIsScheduling(false);
      setActiveTab('sms');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Send Bulk Communication
          </DialogTitle>
          <DialogDescription>
            {productName && `For customers of: ${productName}`}
            <span className="block mt-1 text-sm">
              Total customers: {customers.length} |
              SMS: <Badge variant="outline" className="ml-1">{smsRecipients.length}</Badge> |
              Email: <Badge variant="outline" className="ml-1">{emailRecipients.length}</Badge>
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sms' | 'email')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sms">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS Campaign
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email Campaign
            </TabsTrigger>
          </TabsList>

          {/* SMS Tab */}
          <TabsContent value="sms" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="smsName">Campaign Name *</Label>
                <Input
                  id="smsName"
                  placeholder="Product Promotion SMS"
                  value={smsName}
                  onChange={(e) => setSmsName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="smsMessage">Message * (max 160 chars)</Label>
                <Textarea
                  id="smsMessage"
                  placeholder="Special offer just for you! Get 20% off on your next purchase."
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  rows={4}
                  maxLength={160}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    Recipients: {smsRecipients.length}
                  </span>
                  <Badge variant={smsMessage.length > 160 ? 'destructive' : 'secondary'}>
                    {smsMessage.length}/160
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smsSchedule"
                  checked={isScheduling}
                  onChange={(e) => setIsScheduling(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="smsSchedule" className="cursor-pointer">
                  Schedule for later
                </Label>
              </div>

              {isScheduling && (
                <div>
                  <Label htmlFor="smsScheduledFor">Date & Time *</Label>
                  <Input
                    id="smsScheduledFor"
                    type="datetime-local"
                    value={smsScheduledFor}
                    onChange={(e) => setSmsScheduledFor(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Timezone: Asia/Dhaka</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSendSMS} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {isScheduling ? 'Schedule Campaign' : 'Send Now'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="emailName">Campaign Name *</Label>
                <Input
                  id="emailName"
                  placeholder="Product Newsletter"
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="emailSubject">Subject Line *</Label>
                <Input
                  id="emailSubject"
                  placeholder="Special Offer Inside!"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="emailHtml">HTML Content *</Label>
                <Textarea
                  id="emailHtml"
                  placeholder="<html><body><h1>Hello!</h1><p>Check out our special offers...</p></body></html>"
                  value={emailHtml}
                  onChange={(e) => setEmailHtml(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="emailText">Plain Text Version (Optional)</Label>
                <Textarea
                  id="emailText"
                  placeholder="Hello! Check out our special offers..."
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailSchedule"
                  checked={isScheduling}
                  onChange={(e) => setIsScheduling(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="emailSchedule" className="cursor-pointer">
                  Schedule for later
                </Label>
              </div>

              {isScheduling && (
                <div>
                  <Label htmlFor="emailScheduledFor">Date & Time *</Label>
                  <Input
                    id="emailScheduledFor"
                    type="datetime-local"
                    value={emailScheduledFor}
                    onChange={(e) => setEmailScheduledFor(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Timezone: Asia/Dhaka</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {isScheduling ? 'Schedule Campaign' : 'Send Now'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCommunicationModal;
