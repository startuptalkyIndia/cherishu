"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Coins, MessageCircle, Smile } from "lucide-react";

const EMOJIS = ["🎉", "👏", "💯", "❤️", "🔥", "🙌", "💜"];

type R = {
  id: string;
  sender: { id: string; name: string } | null;
  receiver: { id: string; name: string };
  message: string;
  points: number;
  badge: { emoji: string; name: string } | null;
  value: { emoji: string; name: string } | null;
  createdAt: string;
  isSystem?: boolean;
  kind?: string | null;
  reactions: { emoji: string; userId: string; userName: string }[];
  comments: { id: string; userId: string; userName: string; message: string; createdAt: string }[];
};

export default function FeedCard({ recognition: r, currentUserId }: { recognition: R; currentUserId: string }) {
  const [reactions, setReactions] = useState(r.reactions);
  const [comments, setComments] = useState(r.comments);
  const [commentInput, setCommentInput] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [picker, setPicker] = useState(false);

  // Group reactions by emoji
  const groups = reactions.reduce<Record<string, { count: number; mine: boolean }>>((acc, react) => {
    if (!acc[react.emoji]) acc[react.emoji] = { count: 0, mine: false };
    acc[react.emoji].count++;
    if (react.userId === currentUserId) acc[react.emoji].mine = true;
    return acc;
  }, {});

  async function toggleReaction(emoji: string) {
    const mine = reactions.some(r => r.userId === currentUserId && r.emoji === emoji);
    if (mine) {
      setReactions(reactions.filter(x => !(x.userId === currentUserId && x.emoji === emoji)));
    } else {
      setReactions([...reactions, { emoji, userId: currentUserId, userName: "You" }]);
    }
    setPicker(false);
    await fetch(`/api/recognitions/${r.id}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommenting(true);
    const res = await fetch(`/api/recognitions/${r.id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: commentInput }),
    });
    const data = await res.json();
    setCommenting(false);
    if (res.ok) {
      setComments([...comments, data.comment]);
      setCommentInput("");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        {r.isSystem ? (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${r.kind === "birthday" ? "bg-pink-100" : "bg-yellow-100"}`}>
            {r.kind === "birthday" ? "🎂" : "🎉"}
          </div>
        ) : (
          <Link href={`/dashboard/u/${r.sender?.id}`} className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium shrink-0 hover:bg-indigo-200">
            {r.sender?.name[0]?.toUpperCase()}
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {r.isSystem ? (
              <>
                <span className="font-semibold text-gray-900">{r.kind === "birthday" ? "🎂 Birthday!" : "🎉 Work Anniversary!"}</span>
                <span className="text-gray-500">for</span>
              </>
            ) : (
              <>
                <Link href={`/dashboard/u/${r.sender?.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">{r.sender?.name}</Link>
                <span className="text-gray-500">recognized</span>
              </>
            )}
            <Link href={`/dashboard/u/${r.receiver.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">{r.receiver.name}</Link>
            {r.points > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                <Coins className="w-3 h-3" /> +{r.points}
              </span>
            )}
            {r.badge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                {r.badge.emoji} {r.badge.name}
              </span>
            )}
            {r.value && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                {r.value.emoji} {r.value.name}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-700">{r.message}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
          </div>

          {/* Reactions */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap relative">
            {Object.entries(groups).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${data.mine ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <span>{emoji}</span><span className="font-medium">{data.count}</span>
              </button>
            ))}
            <button onClick={() => setPicker(!picker)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs">
              <Smile className="w-3 h-3" /> React
            </button>
            {picker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex gap-1 z-10">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => toggleReaction(e)} className="text-lg hover:bg-gray-100 w-8 h-8 rounded flex items-center justify-center">
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          {comments.length > 0 && (
            <div className="mt-3 space-y-2 pl-3 border-l-2 border-gray-100">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <Link href={`/dashboard/u/${c.userId}`} className="font-medium text-gray-900 hover:text-indigo-600">{c.userName}</Link>
                  <span className="ml-2 text-gray-700">{c.message}</span>
                  <span className="ml-2 text-xs text-gray-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                </div>
              ))}
            </div>
          )}

          {/* Comment composer */}
          <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" disabled={commenting || !commentInput.trim()} className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
