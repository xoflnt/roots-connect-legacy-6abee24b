import { Bell, CheckCircle, XCircle, Megaphone, UserPlus, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { toArabicNum } from "@/utils/arabicUtils";
import { relativeArabicTime } from "@/utils/relativeArabicTime";
import { Skeleton } from "./ui/skeleton";

const typeIcons: Record<AppNotification["type"], { icon: typeof Info; color: string }> = {
  approval: { icon: CheckCircle, color: "text-green-500" },
  rejection: { icon: XCircle, color: "text-destructive" },
  broadcast: { icon: Megaphone, color: "text-blue-500" },
  new_member: { icon: UserPlus, color: "text-green-500" },
  info: { icon: Info, color: "text-muted-foreground" },
};

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const { icon: Icon, color } = typeIcons[notification.type] || typeIcons.info;

  return (
    <button
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-right transition-colors min-h-[48px] border-b border-border/50 last:border-b-0 ${
        notification.is_read ? "bg-background" : "bg-primary/5"
      } hover:bg-muted/50`}
      dir="rtl"
    >
      <div className={`shrink-0 mt-0.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${notification.is_read ? "text-foreground" : "font-bold text-foreground"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">
          {relativeArabicTime(notification.created_at)}
        </p>
      </div>
    </button>
  );
}

function NotificationList({
  notifications,
  unreadCount,
  isLoading,
  markAsRead,
  markAllAsRead,
}: ReturnType<typeof useNotifications>) {
  return (
    <div dir="rtl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h3 className="font-bold text-sm text-foreground">الإشعارات</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7 text-primary">
            تحديد الكل كمقروء
          </Button>
        )}
      </div>
      <ScrollArea className="max-h-[360px]">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
          ))
        )}
      </ScrollArea>
    </div>
  );
}

export function NotificationBell() {
  const notifData = useNotifications();
  const { unreadCount } = notifData;
  const isMobile = useIsMobile();

  const bellButton = (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl text-muted-foreground hover:text-foreground"
      aria-label="الإشعارات"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
          {unreadCount > 9 ? `+${toArabicNum(9)}` : toArabicNum(unreadCount)}
        </span>
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{bellButton}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>الإشعارات</DrawerTitle>
          </DrawerHeader>
          <NotificationList {...notifData} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{bellButton}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <NotificationList {...notifData} />
      </PopoverContent>
    </Popover>
  );
}
