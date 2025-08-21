import { Component, type ReactNode } from 'react';

export class SafeBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e: unknown) { console.error('Reader subtree error:', e); }
  render() { return this.state.hasError ? <div /> : this.props.children; }
}