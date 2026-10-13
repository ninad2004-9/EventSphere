import { BorderBeam } from "@/components/ui/border-beam-search";
import DotCard from "@/components/ui/moving-dot-card";

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SearchBar() {
  return (
    <div style={{ width: 366, maxWidth: "100%", height: 42, borderRadius: 64, overflow: "hidden", position: "relative", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 64,
          background: "#1d1d1d",
          boxShadow: "inset 0 0 0 1px rgba(44,47,54,0.52), inset 0 0 50px 0 rgba(255,255,255,0.02)",
          display: "flex",
          alignItems: "center",
          padding: "0 13px",
          gap: 10,
          color: "#565656",
        }}
      >
        <SearchIcon />
        <span style={{ fontSize: 15, lineHeight: "18px", color: "#565656" }}>Search</span>
      </div>
    </div>
  );
}

export default function Default() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 600,
        maxWidth: "100%",
        minHeight: 360,
        margin: "0 auto",
        background: "#0d0d0f",
        borderRadius: 24,
      }}
    >
      <BorderBeam size="line" colorVariant="colorful" duration={3.1} borderRadius={64}>
        <SearchBar />
      </BorderBeam>
    </div>
  );
}

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <DotCard />
    </div>
  );
};

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const testimonials = [
  {
    quote:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    name: "Herman Melville",
    title: "Moby-Dick",
  },
];

export function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[40rem] rounded-md flex flex-col antialiased bg-black dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
    </div>
  );
}

export { DemoOne };
