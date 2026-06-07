import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const sizeMap = {
  sm: { box: "h-7 w-7", image: 28, text: "text-base" },
  md: { box: "h-8 w-8", image: 32, text: "text-lg" },
  lg: { box: "h-10 w-10", image: 40, text: "text-xl" },
  xl: { box: "h-16 w-16", image: 64, text: "text-2xl" },
  hero: { box: "h-20 w-20 md:h-24 md:w-24", image: 96, text: "text-3xl" },
} as const;

type LogoSize = keyof typeof sizeMap;

export function Logo({
  size = "md",
  showName = true,
  href,
  className,
  nameClassName,
}: {
  size?: LogoSize;
  showName?: boolean;
  href?: string;
  className?: string;
  nameClassName?: string;
}) {
  const config = sizeMap[size];

  const content = (
    <>
      <span className={cn("relative flex shrink-0 items-center justify-center", config.box)}>
        <Image
          src="/logo.png"
          alt={`${APP_NAME} logo`}
          width={config.image}
          height={config.image}
          className="h-full w-full object-contain"
          priority={size === "hero" || size === "xl"}
        />
      </span>
      {showName && (
        <span className={cn("font-semibold", config.text, nameClassName)}>
          {APP_NAME}
        </span>
      )}
    </>
  );

  const classes = cn("flex items-center gap-2", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

export function HeroLogo() {
  return (
    <div className="mb-8 flex justify-center">
      <Logo
        size="hero"
        showName={false}
        className="logo-hero-enter"
      />
    </div>
  );
}
