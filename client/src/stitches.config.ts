// stitches.config.ts
import { createStitches } from "@stitches/react";

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      primary: "#fafafb",
      primaryDimmed: "#aaaaab",
      gray400: "gainsboro",
      gray500: "lightgray",
    },
  },
  media: {
    bp1: "(min-width: 480px)",
  },
  utils: {
    marginX: (value: number) => ({ marginLeft: value, marginRight: value }),
  },
});

export const globalStyles = globalCss({
  "*": { margin: 0, padding: 0 },
  body: {
    fontFamily: "Amiko",
    color: "$primary",
    fontSize: 20,
  },
  a: {
    textDecoration: "none",
    textTransform: "uppercase",
    color: "$primary",
    fontSize: 14,
    letterSpacing: "0.16em",
  },
  "a:hover": {
    fontSize: 14,
    textDecoration: "none",
    color: "$primaryDimmed",
  },
  th: {
    backgroundColor: "#2A2A2A",
    paddingBottom: 4,
    position: "sticky",
    top: 0,
  },
  td: {
    padding: 4,
    paddingLeft: 0,
  },
  ".flex": {
    display: "flex",
    width: "100%",
    height: "100%",
  },
  ".flex-col": {
    flexDirection: "column",
  },
});
