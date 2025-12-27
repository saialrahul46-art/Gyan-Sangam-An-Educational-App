import React from 'react';

declare global {
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

    // These are injected by the build environment
    var __firebase_config: string | undefined;
    var __initial_auth_token: string | undefined;
}