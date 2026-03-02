"use client";

import { useEffect } from "react";
import Script from "next/script";

export function UnicornBackground() {
    return (
        <>
            <div
                data-us-project="RuZ3w7O9jWJAVKBWP3gN"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100vh",
                    zIndex: -1,
                    pointerEvents: "none",
                }}
            ></div>
            <Script
                id="unicorn-studio-script"
                strategy="afterInteractive"
                src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
                onLoad={() => {
                    // @ts-ignore
                    if (window.UnicornStudio && window.UnicornStudio.init) {
                        // @ts-ignore
                        window.UnicornStudio.init();
                    }
                }}
            />
            <Script id="unicorn-studio-init" strategy="afterInteractive">
                {`
          (function() {
            var u = window.UnicornStudio;
            if (u && u.init) {
              u.init();
            } else {
              window.UnicornStudio = { isInitialized: false };
            }
          })();
        `}
            </Script>
        </>
    );
}
