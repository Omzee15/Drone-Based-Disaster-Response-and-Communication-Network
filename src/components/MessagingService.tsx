
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Phone, Check, Loader2 } from 'lucide-react';
import { TwilioResponse } from '@/types/sensor';

interface MessagingServiceProps {
  recipientNumbers?: string[];
  predefinedMessage?: string;
  onMessageSent?: () => void;
}

export const MessagingService: React.FC<MessagingServiceProps> = ({
  recipientNumbers = [],
  predefinedMessage = '',
  onMessageSent,
}) => {
  const [recipients, setRecipients] = useState<string[]>(recipientNumbers);
  const [newRecipient, setNewRecipient] = useState('');
  const [message, setMessage] = useState(predefinedMessage);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleAddRecipient = () => {
    // Simple validation for demonstration
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (index: number) => {
    const updatedRecipients = [...recipients];
    updatedRecipients.splice(index, 1);
    setRecipients(updatedRecipients);
  };

  const sendTwilioMessage = async (to: string, body: string) => {
    try {
      // Call our Twilio endpoint
      const response = await fetch('https://twiliosending.azurewebsites.net/api/sendSMS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          body,
          accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
          authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
          fromNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
        }),
      });

      const result: TwilioResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending Twilio message:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (recipients.length === 0 || !message.trim()) {
      toast({
        title: "Cannot send message",
        description: "Please add at least one recipient and a message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      const successfulSends = [];
      const failedSends = [];
      
      // Send messages to each recipient
      for (const recipient of recipients) {
        try {
          await sendTwilioMessage(recipient, message);
          successfulSends.push(recipient);
        } catch (error) {
          failedSends.push({ recipient, error });
        }
      }
      
      // Show success or partial success message
      if (failedSends.length === 0) {
        toast({
          title: "Messages sent successfully",
          description: `Alert sent to ${successfulSends.length} recipients`,
        });
        
        if (onMessageSent) {
          onMessageSent();
        }
      } else if (successfulSends.length > 0) {
        toast({
          title: "Some messages sent",
          description: `${successfulSends.length} messages sent, ${failedSends.length} failed`,
          variant: "default", // Changed from "warning" to "default"
        });
      } else {
        toast({
          title: "Failed to send messages",
          description: "All messages failed to send. Please check the numbers and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error sending messages",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error('Message sending error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle>Emergency Alert System</CardTitle>
        <CardDescription className="text-slate-300">
          Send alerts to emergency contacts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              Recipients
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter phone number"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button 
                onClick={handleAddRecipient}
                disabled={!newRecipient}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add
              </Button>
            </div>
          </div>

          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient, index) => (
                <div 
                  key={index} 
                  className="inline-flex items-center bg-slate-700 text-white text-sm rounded-full px-3 py-1"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  <span className="mr-1">{recipient}</span>
                  <button 
                    onClick={() => handleRemoveRecipient(index)}
                    className="ml-1 text-slate-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1">
              Message
            </label>
            <Textarea
              placeholder="Type your emergency message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white resize-none"
              rows={4}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSendMessage}
          disabled={recipients.length === 0 || !message.trim() || isSending}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Send Emergency Alerts
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
