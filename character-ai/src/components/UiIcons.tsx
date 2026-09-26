import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ChatBubbleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-8.2L5 20v-3.5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.25 11h.01M12 11h.01M15.75 11h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M5 7.5h14M9 7.5V5h6v2.5M7.5 7.5l.7 12h7.6l.7-12M10 11v5M14 11v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </Icon>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="m12 3 1.35 5.65L19 10l-5.65 1.35L12 17l-1.35-5.65L5 10l5.65-1.35L12 3ZM18.5 15l.55 2.45L21.5 18l-2.45.55L18.5 21l-.55-2.45L15.5 18l2.45-.55L18.5 15Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </Icon>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="m12 3 1.15 1.95 2.22.45 1.7-1.1 1.63 1.63-1.1 1.7.45 2.22L20 11v2l-1.95 1.15-.45 2.22 1.1 1.7-1.63 1.63-1.7-1.1-2.22.45L12 21l-1.15-1.95-2.22-.45-1.7 1.1-1.63-1.63 1.1-1.7-.45-2.22L4 13v-2l1.95-1.15.45-2.22-1.1-1.7 1.63-1.63 1.7 1.1 2.22-.45L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.25"
      />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.4" />
    </Icon>
  );
}

export function PaperclipIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="m8.5 12.5 5.6-5.6a3.2 3.2 0 0 1 4.5 4.5l-7.4 7.4a4.8 4.8 0 0 1-6.8-6.8l7-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </Icon>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="m4 4 16 8-16 8 3.2-8L4 4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path d="M7.2 12H20" stroke="currentColor" strokeWidth="1.6" />
    </Icon>
  );
}
