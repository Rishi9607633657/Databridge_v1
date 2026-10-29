/* If the 3D scene throws (driver issue, lost context), show the 2D fallback instead of a broken card. */
import { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (e: Error) => void;
}

export class SceneErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(e: Error) {
    console.warn('3D view failed, showing the 2D map instead:', e.message);
    this.props.onError?.(e);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
