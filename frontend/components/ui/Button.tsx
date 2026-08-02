"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import { forwardRef } from "react";
import { FiLoader } from "react-icons/fi";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success";
type ButtonSize = "md" | "lg";

const MotionLink = motion.create(Link);

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink shadow-sm shadow-accent/30",
  secondary: "bg-transparent text-ink border border-ink/20 hover:border-ink/40",
  ghost: "bg-transparent text-accent hover:bg-accent/10",
  success: "bg-success text-white shadow-lg shadow-success/40 hover:brightness-110",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base",
};

const baseClassName = `inline-flex items-center justify-center gap-2 rounded-xl font-medium
  transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60`;

const hoverAnimation = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 400, damping: 22 },
};

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

export interface ButtonLinkProps
  extends SharedProps,
    Omit<HTMLMotionProps<"a">, keyof SharedProps | "href"> {
  href: string;
}

export interface ButtonProps
  extends SharedProps,
    Omit<HTMLMotionProps<"button">, keyof SharedProps | "href"> {
  href?: undefined;
}

type Props = ButtonProps | ButtonLinkProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  ({ variant = "primary", size = "md", isLoading, className = "", children, ...props }, ref) => {
    const classes = `${baseClassName} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    if (props.href) {
      const { href, ...anchorProps } = props;
      return (
        <MotionLink
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...hoverAnimation}
          {...anchorProps}
        >
          {isLoading && <FiLoader className="animate-spin" aria-hidden />}
          {children}
        </MotionLink>
      );
    }

    const { disabled, ...buttonProps } = props as ButtonProps;
    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || isLoading}
        className={classes}
        {...(disabled || isLoading ? {} : hoverAnimation)}
        {...buttonProps}
      >
        {isLoading && <FiLoader className="animate-spin" aria-hidden />}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
