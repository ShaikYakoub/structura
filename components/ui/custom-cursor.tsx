"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorState = "default" | "hover" | "click";

export function CustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mouse position values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animation for the ring (follows with delay)
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if device is mobile/touch-enabled
    const checkMobile = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Don't set up cursor on mobile
    if (isMobile) return;

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      // Check what element is under the cursor
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (
        element?.tagName === "A" ||
        element?.tagName === "BUTTON" ||
        element?.closest("a") ||
        element?.closest("button") ||
        element?.classList.contains("interactive")
      ) {
        setCursorState("hover");
      } else {
        setCursorState("default");
      }
    };

    // Hide cursor when mouse leaves window
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Show cursor when mouse enters window
    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Handle hover state for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if hovering over interactive element
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("interactive") ||
        target.closest(".interactive") ||
        target.getAttribute("role") === "button"
      ) {
        setCursorState("hover");
      }
    };

    // Reset to default when not hovering
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if we're moving out of an interactive element or its children
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.classList.contains("interactive") ||
        target.getAttribute("role") === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".interactive")
      ) {
        setCursorState("default");
      }
    };

    // Handle click state
    const handleMouseDown = () => {
      setCursorState("click");
    };

    const handleMouseUp = () => {
      // Check if still hovering over interactive element
      const element = document.elementFromPoint(mouseX.get(), mouseY.get());
      if (
        element?.tagName === "A" ||
        element?.tagName === "BUTTON" ||
        element?.closest("a") ||
        element?.closest("button") ||
        element?.classList.contains("interactive")
      ) {
        setCursorState("hover");
      } else {
        setCursorState("default");
      }
    };

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isMobile, mouseX, mouseY]);

  // Don't render on mobile
  if (isMobile) return null;

  // Get cursor styles based on state
  const getDotScale = () => {
    switch (cursorState) {
      case "hover":
        return 0.5;
      case "click":
        return 0.3;
      default:
        return 1;
    }
  };

  const getRingScale = () => {
    switch (cursorState) {
      case "hover":
        return 1.5;
      case "click":
        return 0.8;
      default:
        return 1;
    }
  };

  const getRingOpacity = () => {
    switch (cursorState) {
      case "hover":
        return 0.7;
      case "click":
        return 0.9;
      default:
        return 0.4;
    }
  };

  return (
    <>
      {/* The Dot - Follows mouse instantly */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: mouseX,
          y: mouseY,
          opacity: isVisible ? 1 : 0,
          zIndex: 2147483647,
        }}
        animate={{
          scale: getDotScale(),
        }}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 20 },
          opacity: { duration: 0.2 },
        }}
      >
        <div
          className={`
            w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2
            bg-primary dark:bg-primary shadow-lg
          `}
        />
      </motion.div>

      {/* The Ring - Follows with spring delay */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          opacity: isVisible ? 1 : 0,
          zIndex: 2147483647,
        }}
        animate={{
          scale: getRingScale(),
        }}
        transition={{
          scale: { type: "spring", stiffness: 300, damping: 20 },
          opacity: { duration: 0.2 },
        }}
      >
        <div
          className={`
            w-8 h-8 rounded-full border-4 -translate-x-1/2 -translate-y-1/2
            border-black shadow-lg
          `}
          style={{
            opacity: getRingOpacity(),
          }}
        />
      </motion.div>
    </>
  );
}
