import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showText = true,
  href,
  className = "",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { box: "h-8 w-8", icon: 32, text: "text-lg", sub: "text-[10px]" },
    md: { box: "h-10 w-10", icon: 40, text: "text-xl", sub: "text-xs" },
    lg: { box: "h-12 w-12", icon: 48, text: "text-2xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Animated Logo Badge */}
      <div
        className={`relative ${currentSize.box} rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/20 transition-transform hover:scale-105 duration-200 shrink-0`}
      >
        <Image
          src="/icon.svg"
          alt="MyFinance Logo"
          width={currentSize.icon}
          height={currentSize.icon}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight leading-none bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-cyan-300 dark:to-indigo-300 bg-clip-text text-transparent ${currentSize.text}`}
          >
            MyFinance
          </span>
          {size === "lg" && (
            <span className={`font-semibold text-muted-foreground mt-0.5 ${currentSize.sub}`}>
              Quản Lý Tài Chính Thông Minh
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
