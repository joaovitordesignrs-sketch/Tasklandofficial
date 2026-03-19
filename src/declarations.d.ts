declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

// Figma Make asset protocol — resolved at build time by the vite plugin
declare module "figma:asset/*" {
  const src: string;
  export default src;
}
