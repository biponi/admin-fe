import React, { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useToast } from "../../components/ui/use-toast";

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface NotificationFormData {
  subject: string;
  message: string;
  topic: string;
  priority: "low" | "normal" | "high" | "urgent";
  actionUrl?: string;
  actionText?: string;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    subject: "",
    message: "",
    topic: "system_alert",
    priority: "normal",
    actionUrl: "",
    actionText: "",
  });


  // Topic options
  const topics = [
    { value: "order_created", label: "🛒 Order Created", icon: "🛒" },
    {
      value: "order_status_changed",
      label: "📦 Order Status Changed",
      icon: "📦",
    },
    { value: "courier_shipped", label: "🚚 Courier Shipped", icon: "🚚" },
    { value: "courier_delivered", label: "✅ Courier Delivered", icon: "✅" },
    { value: "payment_received", label: "💰 Payment Received", icon: "💰" },
    { value: "payment_failed", label: "❌ Payment Failed", icon: "❌" },
    { value: "low_stock", label: "⚠️ Low Stock", icon: "⚠️" },
    { value: "user_registered", label: "👤 User Registered", icon: "👤" },
    { value: "system_alert", label: "🔔 System Alert", icon: "🔔" },
    { value: "new_ticket", label: "🎫 New Ticket", icon: "🎫" },
    { value: "new_message", label: "💬 New Message", icon: "💬" },
    { value: "ticket_assigned", label: "👥 Ticket Assigned", icon: "👥" },
    { value: "ticket_transferred", label: "↔️ Ticket Transferred", icon: "↔️" },
    { value: "agent_requested", label: "🆘 Agent Requested", icon: "🆘" },
    { value: "custom", label: "📨 Custom", icon: "📨" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and message are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:7001";

      // Notifications always go to all panel users via in-app + push
      const payload = {
        subject: formData.subject,
        message: formData.message,
        topic: formData.topic,
        priority: formData.priority,
        ...(formData.actionUrl && { actionUrl: formData.actionUrl }),
        ...(formData.actionText && { actionText: formData.actionText }),
        data: {},
      };

      const response = await axios.post(
        `${apiUrl}/api/v1/notification/send`,
        payload,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Notification sent successfully",
        });
        resetForm();
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      message: "",
      topic: "system_alert",
      priority: "normal",
      actionUrl: "",
      actionText: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>
            Create New Notification
          </DialogTitle>
          <DialogDescription>
            Send a notification to all panel users (in-app + push)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
          {/* Subject */}
          <div>
            <Label htmlFor='subject'>
              Subject <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='subject'
              placeholder='Enter notification subject'
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor='message'>
              Message <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='message'
              placeholder='Enter notification message'
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          {/* Topic and Priority */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='topic'>Topic</Label>
              <Select
                value={formData.topic}
                onValueChange={(value) =>
                  setFormData({ ...formData, topic: value })
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select topic' />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.value} value={topic.value}>
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='priority'>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, priority: value })
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select priority' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>Low</SelectItem>
                  <SelectItem value='normal'>Normal</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='urgent'>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action URL and Text (Optional) */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='actionUrl'>Action URL (Optional)</Label>
              <Input
                id='actionUrl'
                placeholder='/orders/123'
                value={formData.actionUrl}
                onChange={(e) =>
                  setFormData({ ...formData, actionUrl: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor='actionText'>Action Text (Optional)</Label>
              <Input
                id='actionText'
                placeholder='View Order'
                value={formData.actionText}
                onChange={(e) =>
                  setFormData({ ...formData, actionText: e.target.value })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : (
                <>
                  <Send className='mr-2 h-4 w-4' />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotificationModal;
