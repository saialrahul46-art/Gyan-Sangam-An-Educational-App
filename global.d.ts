
declare namespace JSX {
    interface IntrinsicElements {
        'dotlottie-wc': any;
    }
}

declare global {
    // These are injected by the build environment
    var __firebase_config: string | undefined;
    var __initial_auth_token: string | undefined;
}

// Fix: Add export {} to make this file a module and prevent it from overwriting global types.
export {};