
import React from 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                autoplay?: boolean;
                loop?: boolean;
                mode?: string;
            };
        }
    }
}

declare global {
    // Augment NodeJS namespace to include API_KEY in ProcessEnv.
    // We removed the manual 'var process' declaration because it was causing a "Cannot redeclare block-scoped variable" error,
    // implying 'process' is already declared in the environment (e.g., by @types/node or other libs).
    namespace NodeJS {
        interface ProcessEnv {
            API_KEY?: string;
            [key: string]: any;
        }
    }

    // These are injected by the build environment
    var __firebase_config: string | undefined;
    var __initial_auth_token: string | undefined;
}
