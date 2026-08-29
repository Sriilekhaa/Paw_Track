"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  BookOpen,
  Phone,
  Shield,
  AlertTriangle,
  Heart,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  ExternalLink,
  CheckCircle2,
  Stethoscope,
  Info,
  LifeBuoy,
} from "lucide-react";
import { MonkeyIcon, CattleIcon } from "@/components/SpeciesIcons";

interface DirectoryItem {
  id: string;
  name: string;
  category: "shelter" | "hospital" | "ambulance" | "ngo";
  zone: string;
  phone: string;
  hours: string;
  address: string;
  services: string[];
}

const DIRECTORY_DATA: DirectoryItem[] = [
  {
    id: "1",
    name: "Government Central Veterinary Hospital",
    category: "hospital",
    zone: "Central Bengaluru",
    phone: "+91 (080) 2286-0000",
    hours: "24/7 Emergency Trauma Care",
    address: "Queens Road, Shivaji Nagar, Central Bengaluru",
    services: ["Trauma Surgery", "Rabies Isolation", "In-patient Ward", "X-Ray & Ultrasound", "Vaccination"],
  },
  {
    id: "2",
    name: "CUPA (Compassion Unlimited Plus Action) Trauma Centre",
    category: "shelter",
    zone: "Northside Hebbal",
    phone: "+91 98454 25842",
    hours: "24/7 Rapid Emergency Response",
    address: "Veterinary College Campus, Hebbal, Bengaluru",
    services: ["Canine & Feline ICU", "ABC Sterilization", "Cruelty Rescue", "Adoption Wing"],
  },
  {
    id: "3",
    name: "Rapid Municipal Animal Ambulance Helpline (1962)",
    category: "ambulance",
    zone: "East Corridor",
    phone: "1962 / +91 98450 11962",
    hours: "24/7 Toll-Free Emergency Dispatch",
    address: "100 Feet Road Depot, Indiranagar, Bengaluru",
    services: ["Hydraulic Cattle Crane", "Emergency On-site First Aid", "Stretcher Unit", "Highway Rescue"],
  },
  {
    id: "4",
    name: "PFA (People For Animals) Wildlife & Rescue Hospital",
    category: "ngo",
    zone: "South Koramangala",
    phone: "+91 99000 25370",
    hours: "08:00 - 20:00 Daily",
    address: "Near Kengeri Wildlife Reserve, Bengaluru",
    services: ["Avian Manja Treatment", "Simian Electric Burn Rehab", "Wildlife Release", "Sterilization"],
  },
  {
    id: "5",
    name: "CARE (Charlie's Animal Rescue Centre)",
    category: "shelter",
    zone: "Westside Rajajinagar",
    phone: "+91 94839 16058",
    hours: "09:00 - 18:00 Mon-Sat",
    address: "Mitteganahalli, Yelahanka, Bengaluru",
    services: ["Paralyzed Animal Sanctuary", "Canine Hydrotherapy", "Puppy/Kitten Fostering", "Rehab Center"],
  },
];

const FAQS = [
  {
    question: "What is the fastest way to report a life-threatening animal emergency?",
    answer:
      "For severe accidents, arterial bleeding, or suspected rabies biohazards, submit an incident report via the Citizen Portal with urgency markers ('critical injury' or 'foaming'). Our AI triage engine immediately flags the case with high priority (Score ≥ 70) and broadcasts a real-time dispatch alert to all on-duty municipal officers.",
  },
  {
    question: "How does PawTrack protect citizen privacy on animal cruelty reports?",
    answer:
      "All cruelty and abuse reports are handled under strict anonymization protocols. Public maps and transparency feeds aggregate data only to the generalized municipal zone level without publishing raw coordinates or the identity of reporting citizens.",
  },
  {
    question: "What is the Trap-Neuter-Return (TNR) ear-notch rule for street cats and dogs?",
    answer:
      "Street animals with a clean triangular notch on their right ear (or ear-tag) have already undergone humane sterilization and anti-rabies vaccination under the Animal Birth Control (ABC) protocol. They should not be re-captured unless exhibiting new injuries or illness.",
  },
  {
    question: "Can I track the clinical recovery and disposition of an animal I reported?",
    answer:
      "Yes. Citizens can navigate to 'Track My Reports' in the Citizen Portal to view real-time status transitions (Submitted → Classified → Assigned → In Progress → Resolved) along with veterinary resolution notes and sanctuary placement details.",
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const filteredDirectory = DIRECTORY_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = selectedZone === "all" ? true : item.zone === selectedZone;
    const matchesCategory =
      selectedCategory === "all" ? true : item.category === selectedCategory;

    return matchesSearch && matchesZone && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
            <span>Community Knowledge Base & Welfare Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Urban Animal Welfare & Emergency Protocols
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Essential clinical first-aid guidelines, species-specific safety protocols, and a verified municipal shelter directory.
          </p>
        </div>

        {/* Triage Decision Guide */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <LifeBuoy className="w-5 h-5 text-teal-800" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Action Decision Tree: How to Respond
              </h2>
              <p className="text-xs text-slate-500">
                Determine the correct operational response based on observed condition
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
              <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>1. Critical Emergency</span>
              </div>
              <p className="text-xs text-red-950 leading-relaxed">
                Severe bleeding, vehicle hit-and-run trauma, animal unconscious, or suspected rabies with foaming.
              </p>
              <div className="pt-2 border-t border-red-200 text-xs text-red-900 font-semibold space-y-1">
                <div>✓ Submit urgent report on PawTrack</div>
                <div>✓ Keep safe distance (min 5 meters)</div>
                <div>✓ Do not feed water to unconscious animals</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>2. Moderate Triage</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                Animal limping, swollen limb, minor wounds, or orphaned newborn puppies/kittens in exposed areas.
              </p>
              <div className="pt-2 border-t border-amber-200 text-xs text-amber-900 font-semibold space-y-1">
                <div>✓ Log report with photo evidence</div>
                <div>✓ Provide shade and clean drinking water</div>
                <div>✓ Do not attempt amateur bone splints</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-teal-200 bg-teal-50/50 space-y-3">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>3. Routine / ABC Welfare</span>
              </div>
              <p className="text-xs text-teal-950 leading-relaxed">
                Healthy roaming strays, sterilization (ABC) requests, unnotched ear sightings, or general adoption inquiries.
              </p>
              <div className="pt-2 border-t border-teal-200 text-xs text-teal-900 font-semibold space-y-1">
                <div>✓ Schedule via Sterilization Request</div>
                <div>✓ Check for existing ear notch</div>
                <div>✓ Support community caregiver feeding</div>
              </div>
            </div>
          </div>
        </section>

        {/* Species-Specific Safety Protocols */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Species-Specific Safety & Handling Protocols
            </h2>
            <p className="text-xs text-slate-500">
              Clinical rules of engagement tailored to urban wildlife and domestic animals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Monkeys */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-teal-900 font-bold text-sm">
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800">
                  <MonkeyIcon className="w-5 h-5" />
                </div>
                <span>Monkeys / Simian Safety</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Avoid direct eye contact:</strong> Staring or smiling (showing teeth) is perceived as an aggressive threat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Electrical Shock Triage:</strong> Never attempt solitary restraint; monkeys in pain will bite reflexively. Await specialized team.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-700 font-bold">•</span>
                  <span><strong>Safe Food Distance:</strong> If clearing a troop, throw food away from yourself rather than trying to hand-feed.</span>
                </li>
              </ul>
            </div>

            {/* Cattle */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-teal-900 font-bold text-sm">
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800">
                  <CattleIcon className="w-5 h-5" />
                </div>
                <span>Cattle & Bovine Welfare</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Rumen Bloat Warning:</strong> Distended left abdomen indicates acute fermentation; requires urgent vet trocar decompression.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-700 font-bold">•</span>
                  <span><strong>Highway Hazards:</strong> Divert approaching vehicle traffic; do not honk loudly which can induce panic charges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-700 font-bold">•</span>
                  <span><strong>Crane Requirement:</strong> Adult cattle over 300kg require a hydraulic crane unit for humane transport.</span>
                </li>
              </ul>
            </div>

            {/* Dogs */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-teal-900 font-bold text-sm">
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800">
                  <Shield className="w-5 h-5" />
                </div>
                <span>Canine & Dog Care</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Rabies Signs:</strong> Unprovoked snapping, excessive salivation, lower jaw drop, voice change. Maintain isolation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-700 font-bold">•</span>
                  <span><strong>Calm Approach:</strong> Approach sideways with a soft voice. Let the dog sniff the back of your curled hand first.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-700 font-bold">•</span>
                  <span><strong>Bite First Aid:</strong> Wash human bite wounds immediately with soap and running water for 15 mins; get post-exposure vaccine.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Shelter & Emergency Directory */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Verified Municipal Shelter & Helpline Directory
              </h2>
              <p className="text-xs text-slate-500">
                Direct contacts for government hospitals, NGO ambulances, and recovery shelters
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, service..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none w-48"
                />
              </div>

              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 bg-white"
              >
                <option value="all">All Zones</option>
                <option value="Central Bengaluru">Central Bengaluru</option>
                <option value="Northside Hebbal">Northside Hebbal</option>
                <option value="East Corridor">East Corridor</option>
                <option value="South Koramangala">South Koramangala</option>
                <option value="Westside Rajajinagar">Westside Rajajinagar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDirectory.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-slate-200 bg-[#FAFBFD] space-y-3 shadow-2xs hover:border-teal-500 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
                      {item.category}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.address} ({item.zone})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.hours}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.services.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <a
                    href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{item.phone}</span>
                  </a>
                  <span className="text-[11px] font-semibold text-slate-400">Click to call</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive FAQ Accordion */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Guidance on the PawTrack municipal reporting network
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-slate-100">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                  >
                    <span className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-800 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4 text-xs">
          <div>
            <span className="text-white font-bold">PAW TRACK</span> • Urban Animal Welfare & Public Safety Platform
          </div>
          <div>
            Community Resources & Emergency Protocols
          </div>
        </div>
      </footer>
    </div>
  );
}
