import { Button } from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

import { LuChevronDown, LuUser, LuLogOut } from "react-icons/lu";

export function ProfileDropdown() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Dropdown>
      <DropdownTrigger className="">
        <Button
          variant="light"
          isIconOnly
          aria-label="User menu"
          className="w-20 flex space-x-2  border-2 rounded-full"
        >
          <LuUser className="w-4 h-4" />
          <LuChevronDown className="w-4 h-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User actions font-body">
        <DropdownSection title="User">
          <DropdownItem key="profile" textValue="Profile">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-default-500">{user.email}</span>
            </div>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem key="logout" onPress={handleLogout}>
            <div className="flex items-center gap-2">
              <LuLogOut className="w-4 h-4 text-red-400" />
              Log Out
            </div>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
