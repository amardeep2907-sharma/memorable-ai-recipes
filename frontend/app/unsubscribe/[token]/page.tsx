"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { newsletterApi } from "@/lib/api";

export default function UnsubscribePage() {
  const params = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    newsletterApi
      .unsubscribe(params.token)
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"));
  }, [params.token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-plum" />}

      {status === "done" && (
        <>
          <CheckCircle2 className="h-8 w-8 text-sage" />
          <h1 className="mt-4 font-display text-2xl italic">You've been unsubscribed</h1>
          <p className="mt-2 text-sm text-ink/60">
            You won't get any more newsletter emails from Memorable. You can re-subscribe any time from the
            homepage.
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-8 w-8 text-plum" />
          <h1 className="mt-4 font-display text-2xl italic">That link didn't work</h1>
          <p className="mt-2 text-sm text-ink/60">
            This unsubscribe link may have already been used or has expired.
          </p>
        </>
      )}

      <Link href="/" className="btn-secondary mt-8">Back to Memorable</Link>
    </div>
  );
}
