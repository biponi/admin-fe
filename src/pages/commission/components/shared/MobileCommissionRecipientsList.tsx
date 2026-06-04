import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Users } from "lucide-react";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";

interface CommissionRecipient {
  userId: string;
  userName: string;
  userAvatar: string;
  commissionAmount: number;
  productCount: number;
}

interface MobileCommissionRecipientsListProps {
  recipients: CommissionRecipient[];
  className?: string;
}

export const MobileCommissionRecipientsList: React.FC<MobileCommissionRecipientsListProps> = ({
  recipients,
  className = ''
}) => {
  if (recipients.length === 0) {
    return null;
  }

  return (
    <div className={`md:hidden ${className}`}>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <Users className='h-4 w-4 text-muted-foreground' />
            Commission Recipients
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='space-y-2'>
            {recipients.map((recipient) => (
              <div
                key={recipient.userId}
                className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors'
              >
                <div className='flex items-center gap-3 flex-1 min-w-0'>
                  <Avatar className='h-10 w-10 shrink-0'>
                    <AvatarImage
                      src={recipient.userAvatar}
                      alt={recipient.userName}
                    />
                    <AvatarFallback className='bg-primary/10 text-primary font-semibold text-sm'>
                      {recipient.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm truncate'>
                      {recipient.userName}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {recipient.productCount} product{recipient.productCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className='text-right shrink-0 ml-2'>
                  <div className='font-bold text-sm text-primary'>
                    {formatCurrency(recipient.commissionAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
