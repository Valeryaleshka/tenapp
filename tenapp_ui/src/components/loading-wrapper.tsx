import type { ReactNode } from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingWrapperProps {
    isLoading: boolean;
    children: ReactNode;
}

export function LoadingWrapper({ isLoading, children }: LoadingWrapperProps) {
    return (
        <div className="position-relative">
            {children}

            {isLoading && (
                <div
                    className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-white bg-opacity-75 z-3"
                    role="status"
                    aria-live="polite"
                    aria-label="Loading table data"
                >
                    <Spinner animation="border" variant="primary" />
                </div>
            )}
        </div>
    );
}
