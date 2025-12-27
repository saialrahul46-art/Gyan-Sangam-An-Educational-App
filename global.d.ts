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
    // Augment NodeJS ProcessEnv to include API_KEY if process exists
    namespace NodeJS {
        interface ProcessEnv {
            API_KEY?: string;
        }
    }

    // These are injected by the build environment
    var __firebase_config: string | undefined;
    var __initial_auth_token: string | undefined;
}