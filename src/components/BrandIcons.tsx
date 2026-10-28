interface IconProps {
  size?: number;
  className?: string;
}

// 导入本地 SVG 图标
import ClaudeSvg from "@/icons/extracted/claude.svg?url";
import OpenAISvg from "@/icons/extracted/openai.svg?url";
import GeminiSvg from "@/icons/extracted/gemini.svg?url";
import OpenClawSvg from "@/icons/extracted/claw.svg?url";
import HermesPng from "@/icons/extracted/hermes.png";
import KimiSvg from "@/icons/extracted/kimi.svg?url";

export function KimiIcon({ size = 24, className = "" }: IconProps) {
  return (
    <img
      src={KimiSvg}
      width={size}
      height={size}
      className={className}
      alt="Kimi"
      loading="lazy"
    />
  );
}

export function DoubaoIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="6" fill="#00C7C4" />
      <path
        d="M7 11C7 9.34 8.34 8 10 8H14C15.66 8 17 9.34 17 11V13C17 14.66 15.66 16 14 16H10C8.34 16 7 14.66 7 13V11Z"
        fill="white"
      />
      <circle cx="10" cy="11.5" r="1.2" fill="#0F172A" />
      <circle cx="14" cy="11.5" r="1.2" fill="#0F172A" />
      <path
        d="M10.5 13.5C11 14.2 13 14.2 13.5 13.5"
        stroke="#0F172A"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function YuanbaoIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="ybGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ybGrad)" />
      <path
        d="M6 14C6 11 8.5 7 12 7C15.5 7 18 11 18 14C18 16.5 15.5 17.5 12 17.5C8.5 17.5 6 16.5 6 14Z"
        fill="white"
        fillOpacity="0.25"
      />
      <path
        d="M8 12.5C9.5 9.5 14.5 9.5 16 12.5C14.5 15.5 9.5 15.5 8 12.5Z"
        fill="white"
      />
      <circle cx="12" cy="12.5" r="2" fill="#F59E0B" />
    </svg>
  );
}

export function TongyiIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="tyGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#tyGrad)" />
      <circle cx="12" cy="12" r="5.5" stroke="white" strokeWidth="2" strokeDasharray="3 1.5" />
      <path d="M9.5 12H14.5M12 9.5V14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ZhipuIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="zpGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#zpGrad)" />
      <path d="M12 5L17.5 8.2V15.8L12 19L6.5 15.8V8.2L12 5Z" stroke="white" strokeWidth="1.6" />
      <path d="M12 5V12M12 12L17.5 15.8M12 12L6.5 15.8" stroke="white" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.8" fill="#60A5FA" />
    </svg>
  );
}

export function CherryStudioIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16.5 4C14.8 4 12.8 5.2 12 7C11.2 5.2 9.2 4 7.5 4"
        stroke="#16A34A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 7V10"
        stroke="#16A34A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="15" r="4.5" fill="#EF4444" />
      <circle cx="16" cy="15" r="4.5" fill="#DC2626" />
      <path
        d="M6.5 13.5C7 13 8 13 8.5 13.5"
        stroke="#FCA5A5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14.5 13.5C15 13 16 13 16.5 13.5"
        stroke="#FCA5A5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChatboxIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="6" fill="#2563EB" />
      <path
        d="M7 6.5C5.62 6.5 4.5 7.62 4.5 9V14C4.5 15.38 5.62 16.5 7 16.5H8.5V18.8C8.5 19.2 9 19.45 9.3 19.2L12.5 16.5H17C18.38 16.5 19.5 15.38 19.5 14V9C19.5 7.62 18.38 6.5 17 6.5H7Z"
        fill="white"
        fillOpacity="0.25"
      />
      <path
        d="M12 7.5L8.5 13H12L11.5 16.5L15.5 11H12L12 7.5Z"
        fill="white"
      />
    </svg>
  );
}

export function CursorIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="6" fill="#0F172A" />
      <path
        d="M12 5L18 8.5V15.5L12 19L6 15.5V8.5L12 5Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 5V12M12 12L18 8.5M12 12L6 8.5M12 12V19"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClaudeIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img
      src={ClaudeSvg}
      width={size}
      height={size}
      className={className}
      alt="Claude"
      loading="lazy"
    />
  );
}

export function CodexIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img
      src={OpenAISvg}
      width={size}
      height={size}
      className={`dark:brightness-0 dark:invert ${className}`}
      alt="Codex"
      loading="lazy"
    />
  );
}

export function GeminiIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img
      src={GeminiSvg}
      width={size}
      height={size}
      className={className}
      alt="Gemini"
      loading="lazy"
    />
  );
}

export function OpenClawIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img
      src={OpenClawSvg}
      width={size}
      height={size}
      className={className}
      alt="OpenClaw"
      loading="lazy"
    />
  );
}

export function HermesIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img
      src={HermesPng}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      alt="Hermes"
      loading="lazy"
    />
  );
}

// Claude Desktop-style Skills scroll, based on the reference image.
export function SkillsIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 3h14a2 2 0 0 1 2 2v12" />
      <path d="M2 7V5a2 2 0 0 1 4 0v14a2 2 0 0 0 4 0v-2h12v2a2 2 0 0 1-2 2H8" />
      <path d="m9 10.5 1.5-2-.5 2 2-1.5-.5 1.5 2-1.5-.5 1.5 2-2" />
    </svg>
  );
}

// MCP icon uses inline SVG to support currentColor for hover effects
export function McpIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      fill="currentColor"
      fillRule="evenodd"
      height={size}
      width={size}
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z" />
      <path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z" />
    </svg>
  );
}
