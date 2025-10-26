import { ThemeSelect } from "./theme-select";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import AuthModal from "./modal/auth-modal";
import { ProfileDropdown } from "./drop-down/profile-dropdown";

export const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      menuName: "Swap",
      linkPath: "/",
    },
    // {
    //   menuName: "Pointer",
    //   linkPath: "/pointer",
    //   marketingText: "Hot",
    // },
    {
      menuName: "Account",
      linkPath: "/account",
    },
    {
      menuName: "History",
      linkPath: "/history",
    },
  ];

  return (
    <>
      <nav className="w-full font-body fixed z-10 top-0 h-14 bg-section-backround border-b border-[var(--color-border)] shadow-sm">
        <div className="container flex items-center  h-full mx-auto px-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center">
              <Link href="/" className="text-lg font-bold font-head">
                <h1 className="text-xl font-head">WiseRamp</h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:ml-25 items-center space-x-12">
              {navLinks.map(({ menuName, linkPath }, index) => (
                <Link
                  key={index}
                  href={linkPath}
                  className={`flex items-center gap-2 font-medium  transition-all duration-200 ${
                    linkPath === "/"
                      ? pathname === "/"
                        ? "text-black dark:text-white"
                        : "hover:text-primary dark:hover:text-primary text-gray-500 dark:text-gray-300"
                      : pathname.startsWith(linkPath)
                      ? "text-black dark:text-white"
                      : "hover:text-primary dark:hover:text-primary text-gray-500 dark:text-gray-300"
                  }`}
                >
                  <div className="font-bold">{menuName}</div>
                  {/* {marketingText && (
                    <div className="bg-primary/10 text-primary rounded px-1 py-0.5 text-xs">
                      {marketingText}
                    </div>
                  )} */}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Auth & Theme */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex items-center gap-2">
              {!isAuthenticated ? <AuthModal /> : <ProfileDropdown />}
              <ThemeSelect />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 bg-section-backround border-b border-[var(--color-border)] shadow-lg">
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-4 mb-6">
                {navLinks.map(({ menuName, linkPath }, index) => (
                  <Link
                    key={index}
                    href={linkPath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 font-medium py-2 px-3 rounded-md transition-all duration-200 ${
                      linkPath === "/"
                        ? pathname === "/"
                          ? "text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                          : "hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300"
                        : pathname.startsWith(linkPath)
                        ? "text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                        : "hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <div className="font-bold">{menuName}</div>
                    {/* {marketingText && (
                        <div className="bg-primary/10 text-primary rounded px-2 py-1 text-xs ml-auto">
                          {marketingText}
                        </div>
                      )} */}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth & Theme */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  {!isAuthenticated ? <AuthModal /> : <ProfileDropdown />}
                </div>
                <ThemeSelect />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
