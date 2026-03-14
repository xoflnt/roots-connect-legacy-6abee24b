const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export const motionTransition = (t: Record<string, any>) =>
  prefersReducedMotion ? { duration: 0 } : t;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: motionTransition({ duration: 0.2, ease: "easeOut" }),
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: motionTransition({ duration: 0.25, ease: "easeOut" }),
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: motionTransition({ duration: 0.25, ease: "easeOut" }),
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: motionTransition({ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }),
};

export const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export const gentleSpring = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: motionTransition({ duration: 0.25, ease: "easeOut" }),
};
