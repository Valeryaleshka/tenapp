import type {LoadingWrapperProps} from "./loading-wrapper.inrfaces.ts";

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
                    <div className="spinner-border text-primary" role="status" />
                </div>
            )}
        </div>
    );
}
