import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toArabicNum } from "@/utils/arabicUtils";
import { useUsers } from "@/hooks/admin/useUsers";
import { UserCard } from "./UserCard";

export function UsersPage() {
  const { users, total, isLoading, search, setSearch, deleteUser } = useUsers();

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground">المستخدمون الموثّقون</h2>
        {!isLoading && (
          <Badge variant="secondary" className="text-sm">
            {toArabicNum(total)}
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو رقم الجوال..."
          className="pr-10 min-h-12 text-base"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-base">
            {search ? "لا توجد نتائج" : "لا يوجد مستخدمون مسجّلون بعد"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {users.map((user, i) => (
            <UserCard
              key={user.memberId}
              user={user}
              isEven={i % 2 === 0}
              onDelete={() => deleteUser(user.memberId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
