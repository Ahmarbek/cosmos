import { Component, type ReactNode } from 'react';

/**
 * Keeps a WebGL failure from taking the page with it.
 *
 * A context can fail to be created, or be taken away mid-flight — a driver
 * reset, the GPU process being recycled, or the browser deciding a page has
 * asked too much of it. All of those are far likelier on exactly the hardware
 * that needed the fallback in the first place, and without a boundary the
 * error escapes the Canvas, unmounts the tree above it and leaves a black
 * document with the copy still sitting on top of nothing.
 *
 * There is already a complete second rendering of the journey for machines
 * with no WebGL at all, so the honest response to a broken context is to show
 * that, rather than an apology.
 */
export default class CanvasBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Worth one line in the console — it is the difference between "the site
    // is broken" and "this machine could not give the site a GPU".
    console.warn('COSMOS: falling back to the 2D journey —', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
