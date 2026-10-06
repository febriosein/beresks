import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `md-${string}`]: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `md-${string}`]: any;
    }
  }
}
