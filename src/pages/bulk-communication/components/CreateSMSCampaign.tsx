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
  MessageSquare,
  CalendarClock,
  Zap,
} from "lucide-react";

const CreateSMSCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createCampaign } = useBulkCommunication("sms");

  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddRecipient = () => {
    const phone = recipientInput.trim();
    if (!phone) return;

    const bdPhoneRegex = /^(\+880|880)?1[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(phone)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description:
          "Please enter a valid Bangladesh phone number (e.g., +880171234567 or 880171234567 or 01712345678)",
      });
      return;
    }

    let formattedPhone = phone;
    if (phone.startsWith("0")) {
      formattedPhone = "+88" + phone;
    } else if (phone.startsWith("880") && !phone.startsWith("+880")) {
      formattedPhone = "+" + phone;
    }

    if (recipients.includes(formattedPhone)) {
      toast({
        variant: "destructive",
        title: "Duplicate",
        description: "This phone number is already in the list",
      });
      return;
    }

    setRecipients([...recipients, formattedPhone]);
    setRecipientInput("");
  };

  const handleRemoveRecipient = (phone: string) => {
    setRecipients(recipients.filter((r) => r !== phone));
  };

  const handleBulkImport = () => {
    const phones = recipientInput
      .split(/[,\n]+/)
      .map((p) => p.trim())
      .filter((p) => p);

    let added = 0;
    let skipped = 0;

    phones.forEach((phone) => {
      const bdPhoneRegex = /^(\+880|880)?1[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(phone)) {
        skipped++;
        return;
      }

      let formattedPhone = phone;
      if (phone.startsWith("0")) {
        formattedPhone = "+88" + phone;
      } else if (phone.startsWith("880") && !phone.startsWith("+880")) {
        formattedPhone = "+" + phone;
      }

      if (!recipients.includes(formattedPhone)) {
        setRecipients((prev) => [...prev, formattedPhone]);
        added++;
      } else {
        skipped++;
      }
    });

    setRecipientInput("");

    toast({
      title: "Import Complete",
      description: `Added ${added} phone numbers${skipped > 0 ? `, skipped ${skipped}` : ""}`,
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
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Message is required",
      });
      return;
    }
    if (message.length > 160) {
      toast({
        variant: "destructive",
        title: "Message Too Long",
        description: `SMS message is ${message.length} characters. Maximum is 160 characters.`,
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

  const charCount = message.length;
  const charPct = Math.min((charCount / 160) * 100, 100);
  const charOverLimit = charCount > 160;

  return (
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Page header */}
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => navigate("/bulk-communication/sms")}
            className='inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors'>
            <ArrowLeft className='h-4 w-4' />
            Back
          </button>
          <span className='text-slate-300'>/</span>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm'>
              <MessageSquare className='h-4 w-4 text-white' />
            </div>
            <h1 className='text-lg font-semibold text-slate-900'>
              New SMS Campaign
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
                    placeholder='e.g. Summer Sale Announcement'
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    required
                    className='h-9 text-sm border-slate-200 focus-visible:ring-indigo-500'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label
                    htmlFor='message'
                    className='text-xs font-medium text-slate-600'>
                    Message <span className='text-rose-500'>*</span>
                  </Label>
                  <Textarea
                    id='message'
                    placeholder='Type your SMS message here…'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={160}
                    required
                    className='text-sm border-slate-200 resize-none focus-visible:ring-indigo-500'
                  />
                  {/* Character meter */}
                  <div className='space-y-1.5'>
                    <div className='h-1 bg-slate-100 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          charOverLimit
                            ? "bg-rose-500"
                            : charPct > 80
                              ? "bg-amber-400"
                              : "bg-indigo-500"
                        }`}
                        style={{ width: `${charPct}%` }}
                      />
                    </div>
                    <div className='flex justify-between'>
                      <p className='text-xs text-slate-400'>
                        Standard SMS — 160 character limit
                      </p>
                      <span
                        className={`text-xs font-medium tabular-nums ${
                          charOverLimit
                            ? "text-rose-600"
                            : charPct > 80
                              ? "text-amber-600"
                              : "text-slate-500"
                        }`}>
                        {charCount}/160
                      </span>
                    </div>
                  </div>
                </div>
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

                {/* Input row */}
                <div className='flex gap-2'>
                  <Input
                    placeholder='+880171234567 — or paste multiple, comma-separated'
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleBulkImport();
                      }
                    }}
                    className='h-9 text-sm border-slate-200 focus-visible:ring-indigo-500 font-mono'
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

                {/* Recipient list */}
                {recipients.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-medium text-slate-500'>
                        Added numbers
                      </span>
                      <button
                        type='button'
                        onClick={() => setRecipients([])}
                        className='text-xs text-rose-500 hover:text-rose-700 transition-colors'>
                        Clear all
                      </button>
                    </div>
                    <div className='max-h-52 overflow-y-auto rounded-lg border border-slate-100 divide-y divide-slate-50'>
                      {recipients.map((phone, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors'>
                          <span className='text-sm font-mono text-slate-700'>
                            {phone}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleRemoveRecipient(phone)}
                            className='text-slate-300 hover:text-rose-500 transition-colors p-0.5 rounded'>
                            <X className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recipients.length === 0 && (
                  <div className='flex flex-col items-center justify-center py-8 text-slate-300 border border-dashed border-slate-200 rounded-xl'>
                    <Users className='h-7 w-7 mb-2' />
                    <p className='text-xs'>No recipients yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right / Sidebar ── */}
            <div className='space-y-4'>
              {/* Schedule toggle */}
              <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4'>
                <h2 className='text-sm font-semibold text-slate-700 flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-slate-400' />
                  Delivery
                </h2>

                {/* Send now / Schedule toggle */}
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
                      label: "Message length",
                      value: (
                        <span
                          className={
                            charOverLimit ? "text-rose-600" : "text-slate-800"
                          }>
                          {charCount} / 160
                        </span>
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
                          <span className='text-slate-400 text-xs italic'>
                            Not set
                          </span>
                        )
                      ) : (
                        "Immediate"
                      ),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className='flex items-center justify-between'>
                      <dt className='text-xs text-slate-500'>{label}</dt>
                      <dd className='text-xs font-semibold text-slate-800'>
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

export default CreateSMSCampaign;
