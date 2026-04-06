"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type MotionPageProps = React.PropsWithChildren<{
  className?: string;
}>;

export function MotionPage({ children, className }: MotionPageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("space-y-6", className)}
      initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
      transition={{
        duration: reduceMotion ? 0 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

type MotionSectionProps = React.PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

export function MotionSection({
  children,
  className,
  delay = 0,
}: MotionSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

type MotionCardProps = React.PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

export function MotionCard({
  children,
  className,
  delay = 0,
}: MotionCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
      transition={{
        duration: reduceMotion ? 0 : 0.38,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

type MotionProgressProps = {
  value: number;
  className?: string;
};

export function MotionProgress({ value, className }: MotionProgressProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn("h-full rounded-full", className)}
        initial={reduceMotion ? undefined : { width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{
          duration: reduceMotion ? 0 : 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </div>
  );
}
