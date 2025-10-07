'use client';

import React, { useState } from "react";
import { Search } from "lucide-react";
import { CommandMenu } from "./command-menu";
import { Button } from "../ui/button";

/**
 * The main header component for the application, displayed on most pages.
 * It provides a central search bar to open the command menu.
 */
export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 p-2 flex justify-center">
        <nav 
          className="relative flex h-16 items-center justify-center rounded-full p-1 px-4"
        >
          <Button 
            variant="outline" 
            className="w-64 md:w-80 lg:w-96 h-12 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground shadow-lg border-white/20"
            style={{ backdropFilter: "blur(8px)" }}
            onClick={() => setOpen(true)}
          >
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span>Spotlight Search</span>
              </div>
          </Button>
        </nav>
      </div>
      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  );
}
