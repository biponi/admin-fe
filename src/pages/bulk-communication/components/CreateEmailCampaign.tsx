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
import { ArrowLeft, Send, Clock, Users, Plus, X, Mail } from 'lucide-react';

const CreateEmailCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createCampaign } = useBulkCommunication('email');

  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddRecipient = () => {
    const email = recipientInput.trim().toLowerCase();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
      });
      return;
    }

    if (recipients.includes(email)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate',
        description: 'This email is already in the list',
      });
      return;
    }

    setRecipients([...recipients, email]);
    setRecipientInput('');
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleBulkImport = () => {
    const emails = recipientInput
      .split(/[,\n]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e);

    let added = 0;
    let skipped = 0;

    emails.forEach(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        skipped++;
        return;
      }

      if (!recipients.includes(email)) {
        setRecipients(prev => [...prev, email]);
        added++;
      } else {
        skipped++;
      }
    });

    setRecipientInput('');

    toast({
      title: 'Import Complete',
      description: `Added ${added} email addresses${skipped > 0 ? `, skipped ${skipped}` : ''}`,
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

    if (!subject.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Email subject is required',
      });
      return;
    }

    if (!htmlContent.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Email content is required',
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
      subject,
      html: htmlContent,
      text: textContent || undefined,
      recipients,
      scheduledFor: isScheduling ? scheduledFor : undefined,
    };

    const campaignId = await createCampaign(campaignData);

    setLoading(false);

    if (campaignId) {
      navigate(`/bulk-communication/email/${campaignId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/bulk-communication/email')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <h1 className="text-2xl font-bold">Create Email Campaign</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle>Email Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    placeholder="Monthly Newsletter"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject Line *</Label>
                  <Input
                    id="subject"
                    placeholder="Your Monthly Update from PriorBD"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Email Content</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showPreview ? (
                  <div className="border rounded-lg p-4">
                    <div className="mb-4 pb-4 border-b">
                      <p className="font-semibold text-lg">{subject || '(No subject)'}</p>
                      <p className="text-sm text-gray-500">To: {recipients.length} recipients</p>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-gray-500">No content</p>' }} />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="htmlContent">HTML Content *</Label>
                      <Textarea
                        id="htmlContent"
                        placeholder="<html><body><h1>Hello!</h1><p>This is your newsletter...</p></body></html>"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="textContent">Plain Text Version (Optional)</Label>
                      <Textarea
                        id="textContent"
                        placeholder="Hello! This is your newsletter..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={5}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended for email clients that don't support HTML
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recipients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Recipients
                  </span>
                  <Badge variant="outline">{recipients.length} added</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="user@example.com or paste multiple emails separated by commas"
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
                      {recipients.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm font-mono">{email}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRecipient(email)}
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
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-semibold text-xs truncate max-w-[150px]">
                    {subject || '(No subject)'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">HTML Content:</span>
                  <span className="font-semibold">
                    {htmlContent.length > 0 ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plain Text:</span>
                  <span className="font-semibold">
                    {textContent.length > 0 ? 'Yes' : 'No'}
                  </span>
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

export default CreateEmailCampaign;
