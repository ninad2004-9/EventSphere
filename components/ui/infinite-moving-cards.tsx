import React, { useEffect, useState, useRef } from "react";

export interface MovingCardItem {
  quote?: string;
  name?: string;
  title?: string;
  category?: string;
  image?: string;
  icon?: string;
  badgeClass?: string;
}

export interface InfiniteMovingCardsProps {
  items: MovingCardItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className = "",
}: InfiniteMovingCardsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)] ${className}`}
      style={{
        width: "100%",
      }}
    >
      <ul
        ref={scrollerRef}
        className={`flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap ${
          start ? "animate-scroll" : ""
        } ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          display: "flex",
          gap: "16px",
          animation: start
            ? `scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite`
            : "none",
        }}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="w-[350px] max-w-full relative rounded-2xl border border-b-0 flex-shrink-0 border-slate-700 px-8 py-6 md:w-[450px]"
            style={{
              background:
                "linear-gradient(180deg, var(--slate-800), var(--slate-900)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "24px 28px",
              width: "380px",
              flexShrink: 0,
              backgroundColor: "rgba(13, 14, 22, 0.9)",
              color: "#fff",
            }}
          >
            {item.quote && (
              <blockquote>
                <span className="relative z-20 text-sm leading-[1.6] text-gray-200 font-normal">
                  {item.quote}
                </span>
                <div className="relative z-20 mt-6 flex flex-row items-center">
                  <span className="flex flex-col gap-1">
                    <span className="text-sm leading-[1.6] text-gray-400 font-bold">
                      {item.name}
                    </span>
                    <span className="text-xs leading-[1.6] text-gray-500 font-normal">
                      {item.title}
                    </span>
                  </span>
                </div>
              </blockquote>
            )}

            {item.image && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "120px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title || item.category || "category"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.icon && <span>{item.icon}</span>}
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>
                      {item.title || item.category}
                    </span>
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>&rarr;</span>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfiniteMovingCards;
