"use client";

import { useEffect, useState, useCallback } from "react";
import { getBillBySlug, type Bill, type Participant } from "@/lib/appwrite";

export function DashboardClient({ slug }: { slug: string }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const result = await getBillBySlug(slug);
      if (!result) {
        setError("bill not found");
      } else {
        setBill(result.bill);
        setParticipants(result.participants);
      }
    } catch (err: any) {
      setError(err?.message || "failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/bill/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#080809] flex items-center justify-center">
        <div className="text-center">
          <div className="w-5 h-5 border-2 border-[#1e1e22] border-t-[#f97316] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#5a5550]">loading...</p>
        </div>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="min-h-dvh bg-[#080809] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-[#0e0e10] border border-[#1e1e22] flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#f2efe9] mb-1">dashboard not found</h2>
          <p className="text-sm text-[#9b9590]">this bill might have been deleted.</p>
        </div>
      </div>
    );
  }

  if (!bill) return null;

  const paidCount = participants.filter((p) => p.has_paid).length;
  const unpaidCount = participants.length - paidCount;
  const totalCollected = participants.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const remaining = bill.total_amount - totalCollected;
  const progress = Math.round((paidCount / participants.length) * 100);
  const allPaid = paidCount === participants.length;

  return (
    <main className="min-h-dvh bg-[#080809] text-[#9b9590] p-4 lg:p-8">
      <div className="max-w-xl mx-auto animate-fade-in-up">
        {/* top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-[#5a5550] uppercase tracking-wider mb-1">dashboard</p>
            <h1 className="text-xl font-bold text-[#f2efe9]">{bill.title}</h1>
          </div>
          <a href="/" className="text-sm text-[#f97316] hover:text-[#ea580c] transition-colors font-semibold">
            + new bill
          </a>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-[#1e1e22] bg-[#0e0e10] p-4">
            <p className="text-xs font-semibold text-[#5a5550] mb-1 uppercase tracking-wider">collected</p>
            <p className="text-xl font-bold tabular-nums text-[#22c55e]">rm {totalCollected.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-[#1e1e22] bg-[#0e0e10] p-4">
            <p className="text-xs font-semibold text-[#5a5550] mb-1 uppercase tracking-wider">remaining</p>
            <p className={`text-xl font-bold tabular-nums ${remaining <= 0 ? "text-[#22c55e]" : "text-[#f97316]"}`}>
              rm {remaining <= 0 ? "0.00" : remaining.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-[#1e1e22] bg-[#0e0e10] p-4 col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold text-[#5a5550] mb-1 uppercase tracking-wider">progress</p>
            <p className="text-xl font-bold tabular-nums text-[#f2efe9]">{progress}%</p>
          </div>
        </div>

        {/* progress bar */}
        <div className="mb-6">
          <div className="h-1.5 bg-[#1e1e22] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: allPaid ? "#22c55e" : "#f97316",
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#9b9590]">{paidCount} paid &middot; {unpaidCount} unpaid</span>
            {remaining > 0 && <span className="text-xs text-[#f97316]">rm {remaining.toFixed(2)} left</span>}
          </div>
        </div>

        {/* all paid */}
        {allPaid && (
          <div className="rounded-xl border border-[#22c55e]/20 bg-[#0e0e10] p-5 mb-6 text-center animate-fade-in-up confetti-container">
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="text-2xl mb-1">done</div>
            <h3 className="text-base font-bold text-[#22c55e] mb-1">fully settled</h3>
            <p className="text-sm text-[#9b9590]">everyone has paid. rm {bill.total_amount.toFixed(2)} collected in full.</p>
          </div>
        )}

        {/* share */}
        <div className="rounded-xl border border-[#1e1e22] bg-[#0e0e10] p-4 mb-6">
          <p className="text-xs font-semibold text-[#5a5550] mb-2 uppercase tracking-wider">payment link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-[#080809] border border-[#1e1e22] rounded-lg px-3 py-2.5 truncate font-mono text-[#9b9590]">
              {typeof window !== "undefined" ? `${window.location.origin}/bill/${slug}` : `/bill/${slug}`}
            </code>
            <button
              onClick={copyLink}
              className="cursor-pointer shrink-0 px-3 py-2.5 rounded-lg border border-[#f97316]/40 text-[#f97316] text-xs font-semibold hover:bg-[#f97316] hover:text-[#080809] transition-colors"
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <p className="text-xs text-[#9b9590] mt-2">share this link with participants. they can confirm payment with one tap.</p>
        </div>

        {/* participants */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#5a5550] mb-3 uppercase tracking-wider">participants</p>
          <div className="space-y-2">
            {participants.map((p, i) => (
              <div
                key={p.$id}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-3 border transition-colors animate-fade-in-up stagger-${i + 1} ${p.has_paid ? "border-[#22c55e]/20 bg-[#0e0e10]" : "border-[#1e1e22] bg-[#0e0e10]"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-mono shrink-0 ${p.has_paid ? "bg-[#22c55e] text-[#080809]" : "bg-[#f97316]/10 text-[#f97316]"}`}>
                  {p.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f2efe9] truncate">{p.name}</p>
                  <p className="text-xs text-[#9b9590]">
                    {p.has_paid
                      ? `paid rm ${(p.paid_amount || 0).toFixed(2)}${p.paid_at ? ` on ${new Date(p.paid_at).toLocaleDateString("en-MY")}` : ""}`
                      : "waiting for payment"}
                  </p>
                </div>
                <div className="shrink-0">
                  {p.has_paid ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[#22c55e] font-semibold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-[#f97316]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* refresh */}
        <div className="text-center">
          <p className="text-xs text-[#5a5550]">
            auto-refreshes every 10s &middot;{" "}
            <button onClick={loadData} className="text-[#f97316] hover:underline font-semibold cursor-pointer">
              refresh now
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
