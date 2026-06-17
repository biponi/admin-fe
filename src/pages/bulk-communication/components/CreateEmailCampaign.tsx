import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { useToast } from "../../../components/ui/use-toast";
import { useBulkCommunication } from "../hooks/useBulkCommunication";
import {
  ArrowLeft,
  Send,
  Clock,
  Users,
  Plus,
  X,
  Mail,
  Eye,
  Code2,
  CalendarClock,
  Zap,
  FileText,
} from "lucide-react";

const CreateEmailCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createCampaign } = useBulkCommunication("email");

  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [textContent, setTextContent] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddRecipient = () => {
    const email = recipientInput.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }
    if (recipients.includes(email)) {
      toast({
        variant: "destructive",
        title: "Duplicate",
        description: "This email is already in the list",
      });
      return;
    }

    setRecipients([...recipients, email]);
    setRecipientInput("");
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleBulkImport = () => {
    const emails = recipientInput
      .split(/[,\n]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e);

    let added = 0;
    let skipped = 0;

    emails.forEach((email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        skipped++;
        return;
      }
      if (!recipients.includes(email)) {
        setRecipients((prev) => [...prev, email]);
        added++;
      } else {
        skipped++;
      }
    });

    setRecipientInput("");
    toast({
      title: "Import Complete",
      description: `Added ${added} email addresses${skipped > 0 ? `, skipped ${skipped}` : ""}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Campaign name is required",
      });
      return;
    }
    if (!subject.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Email subject is required",
      });
      return;
    }
    if (!htmlContent.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Email content is required",
      });
      return;
    }
    if (recipients.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At least one recipient is required",
      });
      return;
    }
    if (isScheduling && !scheduledFor) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Scheduled date and time is required",
      });
      return;
    }
    if (isScheduling && new Date(scheduledFor) <= new Date()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Scheduled time must be in the future",
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
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Page header */}
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => navigate("/bulk-communication/email")}
            className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors'>
            <ArrowLeft className='h-4 w-4' />
            Back
          </button>
          <span className='text-slate-300'>/</span>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm'>
              <Mail className='h-4 w-4 text-white' />
            </div>
            <h1 className='text-lg font-semibold text-slate-900'>
              New Email Campaign
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
            {/* ── Left / Main ── */}
            <div className='lg:col-span-2 space-y-5'>
              {/* Campaign info */}
              <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5'>
                <h2 className='text-sm font-semibold text-slate-700'>
                  Campaign details
                </h2>

                <div className='space-y-1.5'>
                  <Label
                    htmlFor='campaignName'
                    className='text-xs font-medium text-slate-600'>
                    Campaign name <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    id='campaignName'
                    placeholder='e.g. Monthly Newsletter'
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    required
                    className='h-9 text-sm border-slate-200 focus-visible:ring-indigo-500'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label
                    htmlFor='subject'
                    className='text-xs font-medium text-slate-600'>
                    Subject line <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    id='subject'
                    placeholder='e.g. Your Monthly Update from PriorBD'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className='h-9 text-sm border-slate-200 focus-visible:ring-indigo-500'
                  />
                </div>
              </div>

              {/* Email content */}
              <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-sm font-semibold text-slate-700'>
                    Email content
                  </h2>
                  <button
                    type='button'
                    onClick={() => setShowPreview(!showPreview)}
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors'>
                    {showPreview ? (
                      <>
                        <Code2 className='h-3.5 w-3.5' />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className='h-3.5 w-3.5' />
                        Preview
                      </>
                    )}
                  </button>
                </div>

                {showPreview ? (
                  <div className='rounded-xl border border-slate-100 overflow-hidden'>
                    {/* Mock email client header */}
                    <div className='bg-slate-50 border-b border-slate-100 px-4 py-3 space-y-1'>
                      <p className='text-sm font-semibold text-slate-800'>
                        {subject || "(No subject)"}
                      </p>
                      <p className='text-xs text-slate-400'>
                        To: {recipients.length} recipient
                        {recipients.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div
                      className='p-4 prose prose-sm max-w-none text-slate-700'
                      dangerouslySetInnerHTML={{
                        __html:
                          htmlContent ||
                          '<p style="color:#94a3b8">No content yet — switch to Edit to add HTML.</p>',
                      }}
                    />
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='space-y-1.5'>
                      <div className='flex items-center gap-2'>
                        <Label
                          htmlFor='htmlContent'
                          className='text-xs font-medium text-slate-600'>
                          HTML content <span className='text-rose-500'>*</span>
                        </Label>
                        <span className='text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono'>
                          HTML
                        </span>
                      </div>
                      <Textarea
                        id='htmlContent'
                        placeholder={
                          "<html>\n  <body>\n    <h1>Hello!</h1>\n    <p>This is your newsletter…</p>\n  </body>\n</html>"
                        }
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        rows={10}
                        className='font-mono text-xs border-slate-200 focus-visible:ring-indigo-500 resize-y'
                        required
                      />
                      <p className='text-xs text-slate-400'>
                        {htmlContent.length > 0
                          ? `${htmlContent.length.toLocaleString()} characters`
                          : "Paste or type your HTML email template"}
                      </p>
                    </div>

                    <div className='space-y-1.5'>
                      <div className='flex items-center gap-2'>
                        <Label
                          htmlFor='textContent'
                          className='text-xs font-medium text-slate-600'>
                          Plain text version
                        </Label>
                        <span className='text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono'>
                          TXT
                        </span>
                        <span className='text-[10px] text-slate-400'>
                          optional
                        </span>
                      </div>
                      <Textarea
                        id='textContent'
                        placeholder='Hello! This is your newsletter…'
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={4}
                        className='font-mono text-xs border-slate-200 focus-visible:ring-indigo-500 resize-y'
                      />
                      <p className='text-xs text-slate-400'>
                        Fallback for email clients that don't render HTML
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipients */}
              <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-sm font-semibold text-slate-700'>
                    Recipients
                  </h2>
                  {recipients.length > 0 && (
                    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'>
                      <Users className='h-3 w-3' />
                      {recipients.length} added
                    </span>
                  )}
                </div>

                <div className='flex gap-2'>
                  <Input
                    placeholder='user@example.com — or paste multiple, comma-separated'
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleBulkImport();
                      }
                    }}
                    className='h-9 text-sm border-slate-200 focus-visible:ring-indigo-500'
                  />
                  <button
                    type='button'
                    onClick={handleAddRecipient}
                    className='h-9 px-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center gap-1.5 shrink-0'>
                    <Plus className='h-3.5 w-3.5' />
                    Add
                  </button>
                  <button
                    type='button'
                    onClick={handleBulkImport}
                    className='h-9 px-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0'>
                    Bulk import
                  </button>
                </div>

                {recipients.length > 0 ? (
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-medium text-slate-500'>
                        Added addresses
                      </span>
                      <button
                        type='button'
                        onClick={() => setRecipients([])}
                        className='text-xs text-rose-500 hover:text-rose-700 transition-colors'>
                        Clear all
                      </button>
                    </div>
                    <div className='max-h-52 overflow-y-auto rounded-lg border border-slate-100 divide-y divide-slate-50'>
                      {recipients.map((email, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors group'>
                          <span className='text-sm font-mono text-slate-700 truncate'>
                            {email}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleRemoveRecipient(email)}
                            className='text-slate-300 hover:text-rose-500 transition-colors p-0.5 rounded shrink-0 ml-2'>
                            <X className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-8 text-slate-300 border border-dashed border-slate-200 rounded-xl'>
                    <Mail className='h-7 w-7 mb-2' />
                    <p className='text-xs'>No recipients yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right / Sidebar ── */}
            <div className='space-y-4'>
              {/* Delivery */}
              <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4'>
                <h2 className='text-sm font-semibold text-slate-700 flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-slate-400' />
                  Delivery
                </h2>

                <div className='grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl'>
                  <button
                    type='button'
                    onClick={() => setIsScheduling(false)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      !isScheduling
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}>
                    <Zap className='h-3.5 w-3.5' />
                    Send now
                  </button>
                  <button
                    type='button'
                    onClick={() => setIsScheduling(true)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isScheduling
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}>
                    <CalendarClock className='h-3.5 w-3.5' />
                    Schedule
                  </button>
                </div>

                {isScheduling && (
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='scheduledFor'
                      className='text-xs font-medium text-slate-600'>
                      Date & time <span className='text-rose-500'>*</span>
                    </Label>
                    <Input
                      id='scheduledFor'
                      type='datetime-local'
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className='h-9 text-sm border-slate-200 focus-visible:ring-indigo-500'
                    />
                    <p className='text-xs text-slate-400'>
                      Timezone: Asia/Dhaka
                    </p>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3'>
                <h2 className='text-sm font-semibold text-slate-700'>
                  Summary
                </h2>
                <dl className='space-y-2.5'>
                  {[
                    {
                      label: "Recipients",
                      value: recipients.length.toLocaleString(),
                    },
                    {
                      label: "Subject",
                      value: subject ? (
                        <span className='truncate max-w-[130px] block text-right'>
                          {subject}
                        </span>
                      ) : (
                        <span className='text-slate-300 italic'>Not set</span>
                      ),
                    },
                    {
                      label: "HTML content",
                      value:
                        htmlContent.length > 0 ? (
                          <span className='text-emerald-600'>Ready</span>
                        ) : (
                          <span className='text-slate-300 italic'>Empty</span>
                        ),
                    },
                    {
                      label: "Plain text",
                      value:
                        textContent.length > 0 ? (
                          <span className='text-emerald-600'>Added</span>
                        ) : (
                          <span className='text-slate-400'>Not added</span>
                        ),
                    },
                    {
                      label: "Delivery",
                      value: isScheduling ? (
                        scheduledFor ? (
                          <span className='text-indigo-600 text-xs'>
                            {new Date(scheduledFor).toLocaleString("en-BD", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span className='text-slate-300 italic'>Not set</span>
                        )
                      ) : (
                        "Immediate"
                      ),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className='flex items-start justify-between gap-2'>
                      <dt className='text-xs text-slate-500 shrink-0'>
                        {label}
                      </dt>
                      <dd className='text-xs font-semibold text-slate-800 text-right'>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Submit */}
              <button
                type='submit'
                disabled={loading}
                className='w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200'>
                {loading ? (
                  <span className='flex items-center gap-2'>
                    <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Creating…
                  </span>
                ) : (
                  <>
                    <Send className='h-4 w-4' />
                    {isScheduling ? "Schedule Campaign" : "Send Now"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmailCampaign;
