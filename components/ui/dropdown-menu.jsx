"use client";
import React, { useState, createContext, useContext } from "react";

const DropdownContext = createContext();

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }) {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  
  if (asChild) {
    return React.cloneElement(children, {
      className: `${children?.props?.className || ""} cursor-pointer`,
      onClick: () => setIsOpen(!isOpen)
    });
  }
  return <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>{children}</div>;
}

export function DropdownMenuContent({ children }) {
  const { isOpen } = useContext(DropdownContext);
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-border p-1">
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children }) {
  const { setIsOpen } = useContext(DropdownContext);
  return (
    <div 
      className="text-foreground block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
      onClick={() => setIsOpen(false)}
    >
      {children}
    </div>
  );
}
