import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";

export const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="sm"
      variant="ghost"
      className="w-full justify-center hover:bg-transparent bg-transparent dark:bg-transparent dark:hover:bg-transparent"
      aria-label="Toggle theme"
    >
      <div className="flex gap-2 dark:hidden">
        <Moon className="text-[10px]" />
        {/* <span className="block lg:hidden"> Escuro </span> */}
      </div>

      <div className="dark:flex gap-2 hidden">
        <Sun className="text-[10px]" />
        {/* <span className="block lg:hidden">Claro</span> */}
      </div>

      {/* <span className="sr-only">Trocar de tema</span> */}
    </Button>
  );
};
