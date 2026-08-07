import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, background: '#fee2e2', color: '#991b1b', height: '100vh' }}>
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    <pre style={{ fontSize: '0.8rem' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
