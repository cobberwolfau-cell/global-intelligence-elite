/// <reference types="vite/client" />

// TypeScript declaration for iconify-icon web component
declare namespace JSX {
  interface IntrinsicElements {
    'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      icon?: string;
      width?: number | string;
      height?: number | string;
      class?: string;
    };
  }
}
