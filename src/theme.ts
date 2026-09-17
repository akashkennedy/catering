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
    leaf: shades("#97A54B"),
    kumkum: shades("#8B2E2E"),
  },
  primaryColor: "leaf",
  autoContrast: true,
});