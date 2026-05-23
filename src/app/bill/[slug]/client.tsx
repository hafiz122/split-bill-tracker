"use client";

import { useEffect, useState } from "react";
import {
  getBillBySlug,
  markAsPaid,
  type Bill,
  type Participant,
} from "@/lib/appwrite";

export function BillViewClient({ slug }: { slug: string }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [paid, setPaid] = useState<string | null>(null);

  useEffect(() => {
    loadBill();
  }, [slug]);

  const loadBill = async () => {
    try {
      const result = await getBillBySlug(slug);
      if (!result) {
        setError("bill not found");
      } else {
        setBill(result.bill);
        setParticipants(result.participants);
      }
    } catch (err: any) {
      setError(err?.message || "failed to load bill");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (participant: Participant) => {
    setConfirming(participant.$id);
    try {
      const perPerson = bill ? bill.total_amount / bill.participant_count : 0;
      await markAsPaid(participant.$id, perPerson);
      setPaid(participant.name);
      await loadBill();
    } catch (err: any) {
      setError(err?.message || "failed to confirm payment");
    } finally {
      setConfirming(null);
    }
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
          <h2 className="text-xl font-bold text-[#f2efe9] mb-1">bill not found</h2>
          <p className="text-sm text-[#9b9590]">this link might be broken or the bill was deleted.</p>
        </div>
      </div>
    );
  }

  if (!bill) return null;

  const perPerson = bill.total_amount / bill.participant_count;
  const paidCount = participants.filter((p) => p.has_paid).length;
  const allPaid = paidCount === participants.length;

  return (
    <div className="min-h-dvh bg-[#080809] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#5a5550] mb-3 uppercase tracking-wider">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            payment request
          </div>
          <h1 className="text-xl font-bold text-[#f2efe9] mb-1">{bill.title}</h1>
          {bill.description && <p className="text-sm text-[#9b9590]">{bill.description}</p>}
        </div>

        {/* amount card */}
        <div className={`rounded-xl border p-5 mb-5 text-center transition-colors duration-500 ${allPaid ? "border-[#22c55e]/20 bg-[#0e0e10]" : "border-[#1e1e22] bg-[#0e0e10]"}`}>
          <p className="text-xs font-semibold text-[#5a5550] mb-1 uppercase tracking-wider">your share</p>
          <div className="text-3xl font-bold text-[#f2efe9] mb-1 tabular-nums">rm {perPerson.toFixed(2)}</div>
          <p className="text-xs text-[#9b9590]">
            total bill: rm {bill.total_amount.toFixed(2)} &middot; split {bill.participant_count} ways
          </p>
          {bill.due_date && (
            <p className="text-xs text-[#f97316] mt-2">due by {new Date(bill.due_date).toLocaleDateString("en-MY")}</p>
          )}
        </div>

        {/* all paid */}
        {allPaid && (
          <div className="rounded-xl border border-[#22c55e]/20 bg-[#0e0e10] p-4 mb-5 text-center animate-fade-in-up confetti-container">
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="confetti-piece" />
            <div className="text-2xl mb-1">done</div>
            <p className="text-sm font-semibold text-[#22c55e] mb-0.5">all paid up</p>
            <p className="text-xs text-[#9b9590]">everyone has settled. no more chasing needed.</p>
          </div>
        )}

        {/* just paid toast */}
        {paid && (
          <div className="rounded-lg border border-[#22c55e]/20 bg-[#0e0e10] px-4 py-3 mb-5 flex items-center gap-2.5 animate-fade-in-up">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm text-[#22c55e]">payment confirmed for <strong>{paid}</strong></span>
          </div>
        )}

        {/* participants */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#5a5550] uppercase tracking-wider">participants</p>
            <span className="text-xs text-[#9b9590] tabular-nums">{paidCount}/{participants.length} paid</span>
          </div>

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
                  {p.has_paid ? `paid rm ${(p.paid_amount || 0).toFixed(2)}` : "not paid yet"}
                </p>
              </div>
              {p.has_paid ? (
                <span className="text-[#22c55e] shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              ) : (
                <button
                  onClick={() => handleConfirmPayment(p)}
                  disabled={confirming === p.$id}
                  className="cursor-pointer shrink-0 px-3 py-1.5 rounded-lg bg-[#f97316] text-[#080809] text-xs font-semibold hover:bg-[#ea580c] transition-colors disabled:opacity-50"
                >
                  {confirming === p.$id ? "..." : "i paid"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#5a5550] uppercase tracking-wider">progress</span>
            <span className="text-xs text-[#9b9590] tabular-nums">{Math.round((paidCount / participants.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-[#1e1e22] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22c55e] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(paidCount / participants.length) * 100}%` }}
            />
          </div>
        </div>

        {/* footer */}
        <div className="text-center">
          <p className="text-xs text-[#5a5550]">
            organized by {bill.organizer_name || "someone"} &middot; {new Date(bill.created_at || "").toLocaleDateString("en-MY")}
          </p>
        </div>
      </div>
    </div>
  );
}
