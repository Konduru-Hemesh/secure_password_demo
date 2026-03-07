import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Props for the ErrorBoundary component.
 */
interface Props {
    /** The children to render when no error has occurred */
    children: ReactNode;
    /** Optional fallback UI to display when an error occurs */
    fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component.
 */
interface State {
    /** Whether an error has been caught */
    hasError: boolean;
    /** The error object if one occurred */
    error?: Error;
}

/**
 * A standard React Error Boundary component that catches JavaScript errors 
 * anywhere in its child component tree, logs those errors, and displays a fallback UI.
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    /**
     * Updates the state when an error is caught.
     * 
     * @param error The error that was thrown.
     * @returns The updated state.
     */
    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    /**
     * Lifecycle method called after an error has been thrown by a descendant component.
     * 
     * @param error The error that was thrown.
     * @param errorInfo An object with information about which component threw the error.
     */
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    /**
     * Resets the error state, allowing the application to attempt re-rendering.
     */
    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-muted-foreground mb-6">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
