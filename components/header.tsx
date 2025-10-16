import Image from "next/image";

import { ThemeSelect } from "./theme-select";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, History } from "lucide-react";

import { useTheme } from "next-themes";

export const Header = () => {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();

  const currentTheme = resolvedTheme || theme;

  const navLinks = [
    {
      menuName: "Swap",
      linkPath: "/",
      icon: ArrowLeftRight,
    },
    {
      menuName: "Pointer",
      linkPath: "/pointer",
      marketingText: "Hot",
    },
    {
      menuName: "Account",
      linkPath: "/account",
    },
    {
      menuName: "History",
      linkPath: "/history",
      icon: History,
    },
  ];

  return (
    <nav className="w-full font-body fixed z-10 top-0 h-14 bg-section-backround border-b border-[var(--color-border)] shadow-sm">
      <div className="container flex items-center justify-between h-full mx-auto px-4">
        <div className="flex items-center gap-2">
          {/* <Logo /> */}
          <Link href="/" className="text-lg font-bold font-head ">
            {/* <Image
              src={`${
                currentTheme === "dark"
                  ? "/logo/logowhite.svg"
                  : "/logo/logodark.svg"
              }`}
              alt="Card heading icon"
              width={140}
              height={140}
            /> */}

            <h1 className="text-xl font-head">WiseRamp</h1>
          </Link>

          <div className="flex md:gap-x-12 md:ml-20 gap-x-3">
            {navLinks.map(({ menuName, linkPath, marketingText }, index) => (
              <Link
                key={index}
                href={linkPath}
                className={`flex flex-wrap items-center justify-center gap-2 font-medium max-md:text-sm pb-1 transition-all duration-200 ${
                  linkPath === "/"
                    ? pathname === "/"
                      ? "text-black dark:text-white"
                      : "hover:text-primary dark:hover:text-primary text-gray-500 dark:text-gray-300"
                    : pathname.startsWith(linkPath)
                    ? " text-black  dark:text-white"
                    : "hover:text-primary dark:hover:text-primary text-gray-500 dark:text-gray-300"
                }`}
              >
                {/* {Icon && <Icon size={18} />} */}
                <div className="font-bold">{menuName}</div>

                {marketingText && (
                  <div className="bg-primary/10 text-primary rounded px-1 py-0.5 text-xs">
                    {marketingText}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center  md:gap-4 gap-2">
          <ThemeSelect />
        </div>
      </div>
    </nav>
  );
};
