"use client";

import { useEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

function goHome() {
  if (window.location.pathname === "/" || window.location.pathname === "") return false;
  window.location.assign("/");
  return true;
}

function handleBackNavigation() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/project")) {
    goHome();
    return;
  }
  // Home or unknown: swallow back so the gesture does not leave/close the app.
}

/**
 * Android system back + edge swipe → in-app "назад", without exiting.
 * Also catches left-edge swipe in the WebView as a backup.
 */
export function AndroidBackHandler() {
  useEffect(() => {
    let removeCap: (() => void) | undefined;

    if (Capacitor.isNativePlatform()) {
      const pending = CapApp.addListener("backButton", () => {
        handleBackNavigation();
      });
      removeCap = () => {
        void pending.then((handle) => handle.remove());
      };
    }

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      // Only from the left edge — typical Android back-swipe origin.
      // User said "справа налево": on many phones back gesture is from either edge;
      // Android 10+ back is usually from left OR right edge inward.
      const fromLeft = touch.clientX <= 28;
      const fromRight = touch.clientX >= window.innerWidth - 28;
      if (!fromLeft && !fromRight) return;
      tracking = true;
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      if (dy > 80) return;

      // Left-edge swipe to the right OR right-edge swipe to the left → back
      const rightEdgeBack = startX >= window.innerWidth - 28 && dx <= -70;
      const leftEdgeBack = startX <= 28 && dx >= 70;
      // Also accept "справа налево" across the screen as back when on project
      const midSwipeBack =
        startX > window.innerWidth * 0.55 && dx <= -90 && dy < 60;

      if (rightEdgeBack || leftEdgeBack || midSwipeBack) {
        handleBackNavigation();
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      removeCap?.();
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}
