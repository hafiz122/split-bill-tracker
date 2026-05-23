"use client";

import { useState, useRef } from "react";
import { createBill } from "@/lib/appwrite";

export default function HomePage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    slug: string;
    billId: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addParticipant = () => {
    const name = participantInput.trim();
    if (name && !participants.includes(name)) {
      setParticipants([...participants, name]);
      setParticipantInput("");
      inputRef.current?.focus();
    }
  };

  const removeParticipant = (name: string) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addParticipant();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("give your bill a title");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("enter a valid amount");
      return;
    }
    if (participants.length < 2) {
      setError("add at least 2 people to split with");
      return;
    }

    setLoading(true);
    try {
      const result = await createBill({
        title: title.trim(),
        total_amount: parseFloat(amount),
        description: description.trim(),
        due_date: dueDate,
        organizer_name: organizerName.trim() || "organizer",
        participant_count: participants.length,
        participants,
      });

      setCreated({ slug: result.bill.slug, billId: result.bill.$id });
    } catch (err: any) {
      setError(err?.message || "something went wrong. try again.");
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    const link = `${window.location.origin}/bill/${created.slug}`;
    const dashboardLink = `${window.location.origin}/dashboard/${created.slug}`;

    return (
      <main className="min-h-dvh bg-[#080809] flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#0e0e10] border border-[#1e1e22] mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#f2efe9] mb-1">bill created</h2>
            <p className="text-sm text-[#9b9590]">share the link and track payments</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-[#1e1e22] bg-[#0e0e10] p-4">
              <p className="text-xs font-semibold text-[#5a5550] mb-2 tracking-wider uppercase">share this link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-[#080809] border border-[#1e1e22] rounded-lg px-3 py-2.5 truncate font-mono text-[#9b9590]">
                  {link}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(link)}
                  className="cursor-pointer shrink-0 px-3 py-2.5 rounded-lg border border-[#f97316]/40 text-[#f97316] text-xs font-semibold hover:bg-[#f97316] hover:text-[#080809] transition-colors"
                >
                  copy
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigator.clipboard.writeText(link)}
                  className="cursor-pointer flex-1 py-2 rounded-lg border border-[#f97316]/40 text-[#f97316] text-xs font-semibold hover:bg-[#f97316] hover:text-[#080809] transition-colors"
                >
                  copy link
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`hey, please pay your share: ${link}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg bg-[#25D366] text-[#080809] text-xs font-semibold hover:bg-[#20bd5a] transition-colors text-center"
                >
                  share on whatsapp
                </a>
              </div>
            </div>

            <a
              href={dashboardLink}
              className="block w-full text-center py-3 rounded-lg bg-[#f97316] text-[#080809] font-semibold text-sm hover:bg-[#ea580c] transition-colors cursor-pointer"
            >
              view dashboard
            </a>

            <button
              onClick={() => {
                setCreated(null);
                setTitle("");
                setAmount("");
                setDescription("");
                setDueDate("");
                setOrganizerName("");
                setParticipants([]);
              }}
              className="block w-full text-center py-3 rounded-lg border border-[#1e1e22] text-[#9b9590] font-medium text-sm hover:border-[#f97316]/40 hover:text-[#f2efe9] transition-colors cursor-pointer"
            >
              create another bill
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#080809] text-[#9b9590]">
      <div className="flex flex-col lg:flex-row min-h-dvh">
        {/* left - form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-10">
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#f2efe9] mb-1">split</h1>
              <p className="text-sm text-[#9b9590]">
                create a bill, share the link, track who paid. no more awkward chasing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* title */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5550] mb-1.5 uppercase tracking-wider">bill title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="team dinner @ nandos"
                  className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded-lg px-3.5 py-2.5 text-sm text-[#f2efe9] placeholder:text-[#5a5550] focus:outline-none focus:border-[#f97316]/40 transition-colors"
                />
              </div>

              {/* amount + due date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5550] mb-1.5 uppercase tracking-wider">total (rm)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="120.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded-lg px-3.5 py-2.5 text-sm text-[#f2efe9] placeholder:text-[#5a5550] focus:outline-none focus:border-[#f97316]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5a5550] mb-1.5 uppercase tracking-wider">due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded-lg px-3.5 py-2.5 text-sm text-[#f2efe9] focus:outline-none focus:border-[#f97316]/40 transition-colors color-scheme-dark"
                  />
                </div>
              </div>

              {/* description */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5550] mb-1.5 uppercase tracking-wider">
                  description <span className="text-[#5a5550] font-normal lowercase ml-1">optional</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="dinner + drinks, split 4 ways"
                  rows={2}
                  className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded-lg px-3.5 py-2.5 text-sm text-[#f2efe9] placeholder:text-[#5a5550] focus:outline-none focus:border-[#f97316]/40 transition-colors resize-none"
                />
              </div>

              {/* organizer */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5550] mb-1.5 uppercase tracking-wider">your name</label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="ali"
                  className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded-lg px-3.5 py-2.5 text-sm text-[#f2efe9] placeholder:text-[#5a5550] focus:outline-none focus:border-[#f97316]/40 transition-colors"
                />
              </div>

              {/* participants */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5550] mb-1.5 uppercase tracking-wider">participants</label>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={participantInput}
                    onChange={(e) => setParticipantInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="add name + press enter"
                    className="flex-1 bg-[#0e0e10] border border-[#1e1e22] rounded-lg px-3.5 py-2.5 text-sm text-[#f2efe9] placeholder:text-[#5a5550] focus:outline-none focus:border-[#f97316]/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addParticipant}
                    className="cursor-pointer shrink-0 px-4 py-2.5 rounded-lg border border-[#1e1e22] text-[#9b9590] text-xs font-semibold hover:border-[#f97316]/40 hover:text-[#f2efe9] transition-colors"
                  >
                    add
                  </button>
                </div>
                {participants.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {participants.map((name, i) => (
                      <span
                        key={name}
                        className="animate-fade-in-up inline-flex items-center gap-1.5 bg-[#0e0e10] border border-[#1e1e22] rounded-lg px-3 py-1.5 text-sm text-[#f2efe9]"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <span className="w-5 h-5 rounded-full bg-[#f97316]/10 text-[#f97316] flex items-center justify-center text-[10px] font-semibold font-mono">
                          {name[0].toUpperCase()}
                        </span>
                        {name}
                        <button
                          type="button"
                          onClick={() => removeParticipant(name)}
                          className="cursor-pointer ml-1 text-[#5a5550] hover:text-red-400 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* error */}
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 animate-shake">
                  {error}
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer py-3 rounded-lg bg-[#f97316] text-[#080809] font-semibold text-sm hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "creating..." : "create bill"}
              </button>
            </form>
          </div>
        </div>

        {/* right - visual */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-[#0e0e10] border-l border-[#1e1e22] p-8">
          <div className="max-w-sm text-center animate-fade-in-up">
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1e1e22] animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-[#1e1e22]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#f97316] font-mono">/</div>
                  <div className="text-[10px] text-[#5a5550] mt-1 font-medium">split</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#9b9590]">
              <div className="flex items-center gap-3">
                <span className="text-[#f97316] font-semibold text-xs font-mono w-5">01</span>
                <span>create a bill with your group</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#f97316] font-semibold text-xs font-mono w-5">02</span>
                <span>share the link via whatsapp</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#f97316] font-semibold text-xs font-mono w-5">03</span>
                <span>track who paid. done.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
