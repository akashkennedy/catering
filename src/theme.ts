import { createTheme, type MantineColorsTuple } from "@mantine/core";

/**
 * Full 10-step Mantine palettes (index 0 = lightest … 9 = darkest,
 * index 6 = brand). Mantine derives the `light` / `subtle` / `outline`
 * variant backgrounds and foregrounds from opposite ends of this tuple,
 * so every entry must actually differ — a repeated single hex makes the
 * `light` variant's text collapse onto its background in light mode
 * (seen as background-only preset chips / Add Meal button).
 */
const leaf: MantineColorsTuple = [
  "#F5F7E8",
  "#E9EDD2",
  "#DCE2B8",
  "#CDD59B",
  "#B9C47E",
  "#A7B45F",
  "#97A54B",
  "#7E8C3E",
  "#647032",
  "#4A5226",
];

const kumkum: MantineColorsTuple = [
  "#F9EBEB",
  "#F2D5D5",
  "#E5B3B3",
  "#D48F8F",
  "#C06A6A",
  "#A34A4A",
  "#8B2E2E",
  "#732626",
  "#5C1F1F",
  "#451717",
];

export const theme = createTheme({
  fontFamily: "var(--font-catamaran)",
  colors: {
    leaf,
    kumkum,
  },
  primaryColor: "leaf",
  autoContrast: true,
});