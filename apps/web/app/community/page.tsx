"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Users,
  Award,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  Send,
  Heart,
  Filter,
  PlusCircle,
  X,
  Share2,
} from "lucide-react";

interface CommunityTip {
  id: string;
  author: string;
  role: string;
  category: "first_aid" | "monsoon" | "stray_care" | "legal";
  title: string;
  content: string;
  upvotes: number;
  commentsCount: number;
  timeAgo: string;
}

const INITIAL_TIPS: CommunityTip[] = [
  {
    id: "tip-1",
    author: "Dr. Aakash Roy",
    role: "Senior Veterinary Surgeon",
    category: "first_aid",
    title: "How to safely handle a dog with a suspected bone fracture",
    content:
      "Always muzzle or gently tie the snout with a soft cloth before lifting. Even the gentlest companion dog will instinctively bite when in excruciating pain. Use a flat wooden board or blanket as a makeshift stretcher.",
    upvotes: 48,
    commentsCount: 7,
    timeAgo: "2 days ago",
  },
  {
    id: "tip-2",
    author: "Meera Nair",
    role: "Volunteer Caregiver",
    category: "monsoon",
    title: "Monsoon shelter tip: Avoid tin sheets near ground level",
    content:
      "During peak rains, damp tin sheets harbor fungal pathogens and sharp rusted edges injure puppies. Wooden crates placed on bricks provide a dry, elevated micro-habitat for street litters.",
    upvotes: 35,
    commentsCount: 4,
    timeAgo: "3 days ago",
  },
  {
    id: "tip-3",
    author: "Officer Alex Rivera",
    role: "Rapid Field Unit 4",
    category: "stray_care",
    title: "Dehydration prevention during urban heatwaves",
    content:
      "Place wide earthen clay bowls in shaded corners under trees and refill twice daily. Clay keeps the water 4-5 degrees cooler than plastic buckets and prevents mosquito larvae breeding when cleaned regularly.",
    upvotes: 62,
    commentsCount: 11,
    timeAgo: "5 days ago",
  },
];

const RESOLVED_STORIES = [
  {
    id: "CP-4028",
    species: "cat",
    category: "injury",
    title: "Kitten rescued from engine compartment",
    location: "Phoenix Marketcity Basement, Whitefield, Bengaluru",
    vetNotes: "Safely extricated without burns. Cleaned, treated for dehydration at CARE centre, and fostered by community volunteer.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop",
    resolvedAt: "Today, 14:15",
  },
  {
    id: "CP-4025",
    species: "dog",
    category: "injury",
    title: "Fractured limb recovery & release",
    location: "Cubbon Park Gate 2, Central Bengaluru",
    vetNotes: "Cast applied for 3 weeks at CUPA Hebbal. Limb healed perfectly; safely re-integrated into original community pack.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop",
    resolvedAt: "Yesterday",
  },
  {
    id: "CP-4019",
    species: "bird",
    category: "injury",
    title: "Black kite entangled in manja string",
    location: "100 Feet Road Rooftop, Indiranagar, Bengaluru",
    vetNotes: "Carefully removed glass-coated thread from primary flight feathers at PFA Hospital. Hydrated and released after 48h observation.",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop",
    resolvedAt: "3 days ago",
  },
];

export default function CommunityPage() {
  const [tips, setTips] = useState<CommunityTip[]>(INITIAL_TIPS);
  const [upvotedTips, setUpvotedTips] = useState<Record<string, boolean>>({});
  const [tipFilter, setTipFilter] = useState<string>("all");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"first_aid" | "monsoon" | "stray_care" | "legal">("stray_care");
  const [authorName, setAuthorName] = useState("");

  const handleToggleUpvote = (id: string) => {
    const isUpvoted = upvotedTips[id];
    setUpvotedTips((prev) => ({ ...prev, [id]: !isUpvoted }));
    setTips((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, upvotes: t.upvotes + (isUpvoted ? -1 : 1) } : t
      )
    );
  };

  const handleCreateTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTipItem: CommunityTip = {
      id: `tip-${Date.now()}`,
      author: authorName.trim() || "Community Member",
      role: "Verified Citizen",
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      upvotes: 1,
      commentsCount: 0,
      timeAgo: "Just now",
    };

    setTips([newTipItem, ...tips]);
    setUpvotedTips((prev) => ({ ...prev, [newTipItem.id]: true }));
    setIsShareModalOpen(false);
    setNewTitle("");
    setNewContent("");
    setAuthorName("");
  };

  const filteredTips = tips.filter((t) =>
    tipFilter === "all" ? true : t.category === tipFilter
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header Hero */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5 text-teal-700" />
              <span>Citizen Action & Field Impact Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Community Impact & Knowledge Feed
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Celebrating verified rescue recoveries and shared urban animal welfare best practices
            </p>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Share a Welfare Tip</span>
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Community Tips Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Community Safety & Care Tips
              </h2>

              {/* Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setTipFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    tipFilter === "all"
                      ? "bg-teal-800 text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTipFilter("first_aid")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    tipFilter === "first_aid"
                      ? "bg-teal-800 text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  First Aid
                </button>
                <button
                  onClick={() => setTipFilter("stray_care")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    tipFilter === "stray_care"
                      ? "bg-teal-800 text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Stray Care
                </button>
                <button
                  onClick={() => setTipFilter("monsoon")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    tipFilter === "monsoon"
                      ? "bg-teal-800 text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Monsoon
                </button>
              </div>
            </div>

            {/* Tips List */}
            <div className="space-y-4">
              {filteredTips.map((tip) => {
                const isUpvoted = !!upvotedTips[tip.id];
                return (
                  <div
                    key={tip.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-teal-400 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{tip.author}</span>
                        <span className="text-slate-400 ml-2">• {tip.role}</span>
                      </div>
                      <span className="text-slate-400">{tip.timeAgo}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{tip.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{tip.content}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleToggleUpvote(tip.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          isUpvoted
                            ? "bg-teal-100 text-teal-900 border border-teal-300"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-teal-800 text-teal-800" : ""}`} />
                        <span>{tip.upvotes} Helpful</span>
                      </button>

                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{tip.commentsCount} comments</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Leaderboard & Verified Recoveries */}
          <div className="space-y-6">
            {/* Municipal Zone Leaderboard */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Award className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Welfare Efficiency Leaderboard
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Highest resolution rates by municipal district
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50/50 border border-teal-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold text-[11px] flex items-center justify-center">1</span>
                    <span className="font-bold text-slate-900">Northside Hebbal Zone</span>
                  </div>
                  <span className="font-extrabold text-teal-800">88% (42/48)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center">2</span>
                    <span className="font-bold text-slate-900">Central Bengaluru (MG Road)</span>
                  </div>
                  <span className="font-extrabold text-slate-700">87% (54/62)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center">3</span>
                    <span className="font-bold text-slate-900">East Corridor (Indiranagar)</span>
                  </div>
                  <span className="font-extrabold text-slate-700">85% (11/13)</span>
                </div>
              </div>
            </div>

            {/* Verified Public Resolved Stories */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recent Verified Rescues</span>
              </h3>

              <div className="space-y-4">
                {RESOLVED_STORIES.map((story) => (
                  <div
                    key={story.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-[#FAFBFD] space-y-2.5 text-xs"
                  >
                    <div className="flex gap-3">
                      <img
                        src={story.image}
                        alt="Rescue"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">{story.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">{story.resolvedAt}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{story.location}</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 bg-white border border-slate-100 rounded-md p-2">
                      <strong>Outcome:</strong> {story.vetNotes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Share Tip Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Share Animal Welfare Guidance
                </h3>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTip} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g., Sarah Chen"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none bg-white"
                  >
                    <option value="first_aid">Clinical First Aid</option>
                    <option value="stray_care">Stray Feeding & Care</option>
                    <option value="monsoon">Monsoon / Weather Hazard</option>
                    <option value="legal">Animal Rights & ABC Law</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tip Headline</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Safe approach technique for injured birds"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actionable Advice</label>
                  <textarea
                    required
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Provide clear, concise guidance for community caregivers..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-xs cursor-pointer"
                  >
                    Publish to Community
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4 text-xs">
          <div>
            <span className="text-white font-bold">PAW TRACK</span> • Urban Animal Welfare & Public Safety Platform
          </div>
          <div>
            Community Action & Verified Field Outcomes
          </div>
        </div>
      </footer>
    </div>
  );
}
