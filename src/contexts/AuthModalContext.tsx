"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AuthModal } from "@/components/AuthModal";

interface AuthModalContextType {
  openAuthModal: (mode?: "signin" | "signup", message?: string) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | undefined>(undefined);

  const openAuthModal = useCallback((mode: "signin" | "signup" = "signin", message?: string) => {
    setMode(mode);
    setMessage(message);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setMessage(undefined);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        initialMode={mode}
        promptMessage={message}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
