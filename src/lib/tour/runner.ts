"use client";

/**
 * Tour runner. Wraps driver.js with route navigation between steps and
 * waits for target elements to exist (which is necessary because Next.js
 * App Router renders new pages after navigation).
 */

import { driver, type Config, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import type { Router } from "next/router";
import { TOUR_STEPS, type TourStep } from "./steps";

const SEEN_KEY = "atman_tour_seen";

export function hasSeenTour(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SEEN_KEY) === "true";
}

export function markTourSeen(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEN_KEY, "true");
}

type NextRouter = Pick<Router, "push"> | { push: (url: string) => Promise<boolean> | void };

function waitForElement(selector: string, timeoutMs = 3000): Promise<Element | null> {
  return new Promise((resolve) => {
    const found = document.querySelector(selector);
    if (found) {
      resolve(found);
      return;
    }
    const start = Date.now();
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      } else if (Date.now() - start > timeoutMs) {
        observer.disconnect();
        resolve(null);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Backup timeout
    setTimeout(() => {
      observer.disconnect();
      resolve(document.querySelector(selector));
    }, timeoutMs);
  });
}

function buildDriverSteps(steps: TourStep[], router: NextRouter): DriveStep[] {
  return steps.map((step, i) => {
    const driveStep: DriveStep = {
      element: step.element,
      popover: {
        title: step.popover.title,
        description: step.popover.description,
        side: step.popover.side,
        align: step.popover.align,
      },
      onHighlightStarted: async () => {
        // Pre-step navigation
        if (step.navigateTo && window.location.pathname !== step.navigateTo) {
          await router.push(step.navigateTo);
          if (step.element) {
            await waitForElement(step.element);
          }
        }
      },
    };
    void i;
    return driveStep;
  });
}

export function startTour(router: NextRouter): void {
  const config: Config = {
    showProgress: true,
    progressText: "{{current}}/{{total}}",
    nextBtnText: "Siguiente →",
    prevBtnText: "← Anterior",
    doneBtnText: "Terminar",
    allowClose: true,
    overlayColor: "rgba(8, 8, 16, 0.78)",
    steps: buildDriverSteps(TOUR_STEPS, router),
    onDestroyStarted: () => {
      markTourSeen();
      driverInstance?.destroy();
    },
    onDestroyed: () => {
      markTourSeen();
    },
  };

  const driverInstance = driver(config);
  driverInstance.drive();
}
