import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { User } from "lucide-react";

interface RecipientCellProps {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  className?: string;
}

export const RecipientCell = ({
  name,
  email,
  avatar,
  role,
  className = "",
}: RecipientCellProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className="h-8 w-8">
        {avatar ? (
          <AvatarImage src={avatar} alt={name} />
        ) : (
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{name}</span>
        {email && (
          <span className="text-xs text-muted-foreground">{email}</span>
        )}
        {role && (
          <Badge variant="outline" className="text-xs w-fit mt-0.5">
            {role}
          </Badge>
        )}
      </div>
    </div>
  );
};
