"use client";
import { ToggleTheme } from "./toogle-theme"
import { Button } from "./ui/button";
import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Sheet,
} from "./ui/sheet";
// import { Separator } from "@radix-ui/react-dropdown-menu";
import {  Menu } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

// Add new animations
const navVariants = {
  hidden: { y: -100 },
  visible: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const linkVariants = {
  hover: { scale: 1.05, color: "hsl(var(--primary))" },
};

interface RouteProps {
  href: string;
  label: string;
  className?: string;
}

const url = "https://peeppips.com"
const routeList: RouteProps[] = [
  {
    href: `${url}/#home`,
    label: "Home",
  },
  {
    href: `${url}/#features`,
    label: "Features",
  },
  {
    href: `${url}/#how-it-works`,
    label: "How It Works",
  },
  {
    href: `${url}/#about`,
    label: "About",
  },
  {
    href: `${url}/#faq`,
    label: "FAQ",
  },
  // {
  //   href: `${url}/#waitlist`,
  //   label: "Join Waitlist",
  // },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const { theme } = useTheme();

  // Add scroll handler
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = routeList.map((route) => route.href.replace("#", ""));
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border/40 shadow-sm"
    >
      <div className="container flex h-16 items-right justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={theme === "light" ? "/1.png" : "/1.png"}
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
          </motion.div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            PeepPips
          </span>
        </Link>

        {/* Mobile Navigation */}
        <div className="flex items-center lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Menu
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer lg:hidden"
              />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
            >
              <div>
                <SheetHeader className="mb-4 ml-4">
                  <SheetTitle className="flex items-center">
                    <Link href="/" className="flex items-center">
                      <Image
                        src={theme === "light" ? "/logo.png" : "/logo.png"}
                        alt="Logo"
                        width={32}
                        height={32}
                        className="rounded-lg mr-2"
                      />
                      PeepPips
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2">
                  {routeList.map(({ href, label }) => (
                    <Button
                      key={href}
                      onClick={() => setIsOpen(false)}
                      asChild
                      variant="ghost"
                      className="justify-start text-base"
                    >
                      <Link
                        href={href}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpen(false);
                          const id = href.replace(/^.*#/, '');
                          const element = document.getElementById(id);
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth" });
                            window.history.pushState({}, "", href);
                          }
                        }}
                      >
                        {label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              <SheetFooter className="flex-col sm:flex-col justify-start items-start">
                {/* <Separator className="mb-2" /> */}
                <ToggleTheme />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {routeList.map(({ href, label }) => (
            <motion.div
              key={href}
              variants={linkVariants}
              whileHover="hover"
              className="relative"
            >
              <Link
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  const id = href.replace(/^.*#/, '');
                  const element = document.getElementById(id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                    window.history.pushState({}, "", href);
                  }
                }}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === href.replace("#", "")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {label}
                {activeSection === href.replace("#", "") && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeSection"
                  />
                )}
              </Link>
            </motion.div>
          ))}

          <div className="flex items-center space-x-4">
            <ToggleTheme />
            {/* <Button className="bg-primary hover:bg-primary/90">
              Get Started
            </Button> */}
          </div>
        </nav>
      </div>
    </motion.header>
  );
};
