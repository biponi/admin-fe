import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../components/ui/use-toast';
import { useBulkCommunication } from '../hooks/useBulkCommunication';
import { ArrowLeft, Send, Clock, Users, Plus, X } from 'lucide-react';

const CreateSMSCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createCampaign } = useBulkCommunication('sms');

  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddRecipient = () => {
    const phone = recipientInput.trim();
    if (!phone) return;

    // Basic validation for Bangladesh phone numbers
    const bdPhoneRegex = /^(\+880|880)?1[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(phone)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid Bangladesh phone number (e.g., +880171234567 or 880171234567 or 01712345678)',
      });
      return;
    }

    // Format to +880 format
    let formattedPhone = phone;
    if (phone.startsWith('0')) {
      formattedPhone = '+88' + phone;
    } else if (phone.startsWith('880') && !phone.startsWith('+880')) {
      formattedPhone = '+' + phone;
    }

    if (recipients.includes(formattedPhone)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate',
        description: 'This phone number is already in the list',
      });
      return;
    }

    setRecipients([...recipients, formattedPhone]);
    setRecipientInput('');
  };

  const handleRemoveRecipient = (phone: string) => {
    setRecipients(recipients.filter(r => r !== phone));
  };

  const handleBulkImport = () => {
    const phones = recipientInput
      .split(/[,\n]+/)
      .map(p => p.trim())
      .filter(p => p);

    let added = 0;
    let skipped = 0;

    phones.forEach(phone => {
      const bdPhoneRegex = /^(\+880|880)?1[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(phone)) {
        skipped++;
        return;
      }

      let formattedPhone = phone;
      if (phone.startsWith('0')) {
        formattedPhone = '+88' + phone;
      } else if (phone.startsWith('880') && !phone.startsWith('+880')) {
        formattedPhone = '+' + phone;
      }

      if (!recipients.includes(formattedPhone)) {
        setRecipients(prev => [...prev, formattedPhone]);
        added++;
      } else {
        skipped++;
      }
    });

    setRecipientInput('');

    toast({
      title: 'Import Complete',
      description: `Added ${added} phone numbers${skipped > 0 ? `, skipped ${skipped}` : ''}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Campaign name is required',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Message is required',
      });
      return;
    }

    if (message.length > 160) {
      toast({
        variant: 'destructive',
        title: 'Message Too Long',
        description: `SMS message is ${message.length} characters. Maximum is 160 characters.`,
      });
      return;
    }

    if (recipients.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'At least one recipient is required',
      });
      return;
    }

    if (isScheduling && !scheduledFor) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Scheduled date and time is required',
      });
      return;
    }

    if (isScheduling && new Date(scheduledFor) <= new Date()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Scheduled time must be in the future',
      });
      return;
    }

    setLoading(true);

    const campaignData = {
      name: campaignName,
      message,
      recipients,
      scheduledFor: isScheduling ? scheduledFor : undefined,
    };

    const campaignId = await createCampaign(campaignData);

    setLoading(false);

    if (campaignId) {
      navigate(`/bulk-communication/sms/${campaignId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/bulk-communication/sms')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <h1 className="text-2xl font-bold">Create SMS Campaign</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    placeholder="Summer Sale Announcement"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your SMS message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={160}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Maximum 160 characters (standard SMS length)
                    </p>
                    <Badge variant={message.length > 160 ? 'destructive' : 'secondary'}>
                      {message.length}/160
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recipients</span>
                  <Badge variant="outline">{recipients.length} added</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="+880171234567 or paste multiple numbers separated by commas"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBulkImport();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddRecipient}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button type="button" variant="outline" onClick={handleBulkImport}>
                    Bulk Import
                  </Button>
                </div>

                {recipients.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Added Recipients</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setRecipients([])}
                        className="text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {recipients.map((phone, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm font-mono">{phone}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRecipient(phone)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="schedule"
                    checked={isScheduling}
                    onChange={(e) => setIsScheduling(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="schedule" className="cursor-pointer">
                    Schedule for later
                  </Label>
                </div>

                {isScheduling && (
                  <div>
                    <Label htmlFor="scheduledFor">Date & Time *</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Timezone: Asia/Dhaka
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Recipients:</span>
                  <span className="font-semibold">{recipients.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Message Length:</span>
                  <span className="font-semibold">{message.length} chars</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="font-semibold">
                    {isScheduling ? 'Scheduled' : 'Immediate'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isScheduling ? 'Schedule Campaign' : 'Send Now'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateSMSCampaign;
