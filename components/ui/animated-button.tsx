"use client";

import * as React from "react";
import { motion, useHover } from "framer-motion";
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AnimatedButtonProps extends ButtonProps {
  animationType?: "bounce" | "spin" | "none";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

export function AnimatedButton({
  className,
  animationType = "bounce",
  icon: Icon,
  iconPosition = "left",
  children,
  asChild,
  variant,
  size,
  ...props
}: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTapped, setIsTapped] = React.useState(false);

  const handleHoverStart = () => setIsHovered(true);
  const handleHoverEnd = () => setIsHovered(false);
  const handleTapStart = () => setIsTapped(true);
  const handleTapEnd = () => setIsTapped(false);
  if (animationType === "none") {
    return (
      <Button
        className={cn("transition-all duration-200 hover:shadow-lg", className)}
        asChild={asChild}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </Button>
    );
  }

  const buttonBounceVariants = {
    idle: { y: 0 },
    hover: { y: 0 },
    tap: { y: 0 },
  };

  const buttonSpinVariants = {
    idle: { y: 0 },
    hover: { y: 0 },
    tap: { y: 0 },
  };

  const iconBounceVariants = {
    idle: { y: 0, scale: 1, x: 0 },
    hover: { y: 0, scale: 1.1, x: 4 },
    tap: { y: 0, scale: 0.95, x: 0 },
  };

  const iconSpinVariants = {
    idle: { rotate: 0, scale: 1 },
    hover: { rotate: 360, scale: 1.1 },
    tap: { rotate: 180, scale: 0.95 },
  };

  const buttonClasses = cn(
    "transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20",
    buttonVariants({ variant, size }),
    className,
  );

  if (asChild) {
    const child = React.Children.only(children as React.ReactElement);
    const childProps = child.props as any;
    const animatedIcon = Icon ? (
      <motion.div
        animate={isHovered ? "hover" : isTapped ? "tap" : "idle"}
        variants={
          animationType === "spin" ? iconSpinVariants : iconBounceVariants
        }
        transition={
          animationType === "spin"
            ? {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
                scale: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
              }
            : {
                type: "spring",
                stiffness: 400,
                damping: 17,
                scale: { duration: 0.15, ease: [0.4, 0, 0.6, 1] },
                x: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
              }
        }
        className={cn("inline-block")}
      >
        <Icon className="h-4 w-4" />
      </motion.div>
    ) : null;

    const enhancedChild = React.cloneElement(
      child,
      {
        className: cn(childProps.className, buttonClasses),
        ...props,
      } as any,
      ...(iconPosition === "left"
        ? [animatedIcon, childProps.children]
        : [childProps.children, animatedIcon]),
    );

    return (
      <motion.div
        animate={isHovered ? "hover" : isTapped ? "tap" : "idle"}
        variants={
          animationType === "spin" ? buttonSpinVariants : buttonBounceVariants
        }
        initial="idle"
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        onTapStart={handleTapStart}
        onTapEnd={handleTapEnd}
        transition={
          animationType === "spin"
            ? {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }
            : {
                type: "spring",
                stiffness: 400,
                damping: 17,
              }
        }
        className="inline-block"
      >
        {enhancedChild}
      </motion.div>
    );
  }

  const animatedIcon = Icon ? (
    <motion.div
      animate={isHovered ? "hover" : isTapped ? "tap" : "idle"}
      variants={
        animationType === "spin" ? iconSpinVariants : iconBounceVariants
      }
      transition={
        animationType === "spin"
          ? {
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
              scale: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
            }
          : {
              type: "spring",
              stiffness: 400,
              damping: 17,
              scale: { duration: 0.15, ease: [0.4, 0, 0.6, 1] },
              x: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
            }
      }
      className={cn("inline-block")}
    >
      <Icon className="h-4 w-4" />
    </motion.div>
  ) : null;

  return (
    <motion.div
      animate={isHovered ? "hover" : isTapped ? "tap" : "idle"}
      variants={
        animationType === "spin" ? buttonSpinVariants : buttonBounceVariants
      }
      initial="idle"
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onTapStart={handleTapStart}
      onTapEnd={handleTapEnd}
      transition={
        animationType === "spin"
          ? {
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            }
          : {
              type: "spring",
              stiffness: 400,
              damping: 17,
            }
      }
      className="inline-block"
    >
      <Button
        className={buttonClasses}
        variant={variant}
        size={size}
        {...props}
      >
        {iconPosition === "left" && animatedIcon}
        {children}
        {iconPosition === "right" && animatedIcon}
      </Button>
    </motion.div>
  );
}
