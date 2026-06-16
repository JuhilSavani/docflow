import { Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

const UserList = ({ users, currentUserId }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          data-testid="user-list-button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
        >
          <Users className="w-4 h-4" />
          <span>{users.length}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-slate-900">Active Users</h4>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.userId}
                data-testid={`user-item-${user.userId}`}
                className="flex items-center gap-3 py-2"
              >
                <Avatar
                  className="w-8 h-8"
                  style={{ backgroundColor: user.color }}
                >
                  <AvatarFallback
                    className="text-white text-xs font-semibold"
                    style={{ backgroundColor: user.color }}
                  >
                    {getInitials(user.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.userName}
                    {user.userId === currentUserId && (
                      <span className="text-xs text-slate-500 ml-1">(You)</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserList;