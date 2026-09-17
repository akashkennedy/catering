import { createTheme, type MantineColorsTuple } from "@mantine/core";

function shades(hex: string): MantineColorsTuple {
  return [
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
    hex,
  ];
}

export const theme = createTheme({
  fontFamily: "var(--font-catamaran)",
  colors: {
    turmeric: shades("#C68A2E"),
    leaf: shades("#33513B"),
    kumkum: shades("#8B2E2E"),
  },
});