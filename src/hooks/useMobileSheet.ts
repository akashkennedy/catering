"use client";

import type { ModalProps } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export type MobileSheetVariant = "full" | "sheet";

type MobileSheetProps = Pick<
  ModalProps,
  "fullScreen" | "centered" | "size" | "styles" | "transitionProps" | "classNames"
>;

/**
 * Responsive sheet props for form modals.
 * - "full": edge-to-edge full-screen sheet on phones (large forms).
 * - "sheet": bottom sheet on phones (small forms).
 * Desktop props are preserved via `desktopSize`.
 */
export function useMobileSheet(
  variant: MobileSheetVariant = "full",
  desktopSize?: ModalProps["size"]
): MobileSheetProps {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const mobile = isMobile ?? false;

  if (variant === "sheet" && mobile) {
    return {
      fullScreen: false,
      centered: false,
      size: "100%",
      transitionProps: { transition: "slide-up", duration: 250 },
      classNames: { content: "mobile-sheet" },
      styles: {
        inner: { alignItems: "flex-end", padding: 0 },
        content: {
          borderRadius: "16px 16px 0 0",
          maxHeight: "92dvh",
          width: "100%",
          marginLeft: 0,
          marginRight: 0,
          overflowX: "hidden",
        },
        body: { overflowY: "auto", overflowX: "hidden" },
      },
    };
  }

  return {
    fullScreen: mobile && variant === "full",
    centered: !mobile,
    ...(desktopSize !== undefined ? { size: desktopSize } : {}),
  };
}
