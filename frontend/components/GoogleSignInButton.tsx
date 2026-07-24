"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Minimal shape of the Google Identity Services API we actually use -
// there's no official @types package for it, so this keeps things typed
// without pulling in a full ambient declaration file.
interface GoogleIdCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleIdCredentialResponse) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

export default function GoogleSignInButton() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          await loginWithGoogle(response.credential);
          router.push("/dashboard");
        } catch {
          setError("Google sign-in failed. Please try again.");
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: 320,
    });
  }, [scriptReady, clientId, loginWithGoogle, router]);

  if (!clientId) {
    // Scaffold-friendly fallback so the page doesn't silently show nothing
    // when NEXT_PUBLIC_GOOGLE_CLIENT_ID hasn't been set yet.
    return (
      <p className="rounded-lg border border-dashed border-line px-3 py-2 text-center text-xs text-ink/40">
        Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in
      </p>
    );
  }

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={buttonRef} className="flex justify-center" />
      {error && <p className="mt-2 text-center text-xs text-plum">{error}</p>}
    </div>
  );
}
