import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSelect() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark =
    theme === "dark" || (theme === "system" && resolvedTheme === "dark");

  return (
    <div
      className="p-4 flex items-center justify-center relative cursor-pointer bg-[var(--section-backround)] rounded-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Sun icon */}
      <Moon className="absolute h-5 w-5  rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

      {/* Moon icon */}
      <Sun className="absolute h-5 w-5 text-primary  rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </div>
  );
}
