import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isDisabled, setIsDisabled] = useState(false);

  const toggleTheme = () => {
    if (isDisabled) return;

    setIsDisabled(true);
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

    setTimeout(() => {
      setIsDisabled(false);
    }, 500); // 500ms delay
  };

  return (
    <Button
      variant="outline"
      className="relative"
      onClick={toggleTheme}
      disabled={isDisabled}
    >
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
