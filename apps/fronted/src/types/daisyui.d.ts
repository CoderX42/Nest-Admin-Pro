declare module 'daisyui' {
  import type { Config } from 'tailwindcss';
  const daisyui: Config['plugins'][number];
  export default daisyui;
}