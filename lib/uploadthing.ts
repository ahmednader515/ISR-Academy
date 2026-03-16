import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import React, { type ComponentProps } from "react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const sharedButtonClasses =
  "rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-border)]/50 disabled:opacity-50";

const BaseUploadButton = generateUploadButton<OurFileRouter>();
const BaseUploadDropzone = generateUploadDropzone<OurFileRouter>();

type UploadButtonProps = ComponentProps<typeof BaseUploadButton>;
type UploadDropzoneProps = ComponentProps<typeof BaseUploadDropzone>;

export function UploadButton(props: UploadButtonProps) {
  const mergedAppearance = {
    ...props.appearance,
    button: [sharedButtonClasses, props.appearance?.button].filter(Boolean).join(" "),
  };
  return React.createElement(BaseUploadButton, { ...props, appearance: mergedAppearance });
}

export function UploadDropzone(props: UploadDropzoneProps) {
  const mergedAppearance = {
    ...props.appearance,
    button: [sharedButtonClasses, props.appearance?.button].filter(Boolean).join(" "),
  };
  return React.createElement(BaseUploadDropzone, { ...props, appearance: mergedAppearance });
}

