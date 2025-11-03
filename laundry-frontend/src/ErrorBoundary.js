import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // No-op: avoid noisy logging in production
  }

  handleReset = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (_) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
          <h2>Something went wrong.</h2>
          <p style={{ marginTop: 8, color: '#555' }}>Try reloading the page. If the problem persists, click Reset below.</p>
          <button onClick={this.handleReset} style={{ marginTop: 12, padding: '8px 12px', cursor: 'pointer' }}>
            Reset and Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


