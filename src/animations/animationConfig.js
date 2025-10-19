export const transition = { duration: 0.38, ease: "easeInOut" };

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Device Performance Detection
export function isLowEndDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check device memory (in GB) - only available in some browsers
  const memory = navigator.deviceMemory || 2;
  
  // Check connection speed (if available)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.effectiveType === '3g'
  );
  
  // Heuristic for low-end device detection
  const isLowEnd = cores < 2 || memory < 1 || isSlowConnection;
  
  if (isLowEnd) {
    console.log('🐌 Low-end device detected:', { cores, memory, connection: connection?.effectiveType });
  }
  
  return isLowEnd;
}

// Apply low performance mode to document
export function applyLowPerformanceMode() {
  if (typeof document === "undefined") return;
  
  if (isLowEndDevice()) {
    document.documentElement.classList.add('low-performance-mode');
    console.log('🎯 Applied low-performance-mode CSS class');
  }
}

// Enhanced animation config that respects both user preferences and device capabilities
export function shouldReduceAnimations() {
  return prefersReducedMotion() || isLowEndDevice();
}

// Selective animation reduction - keeps essential loading animations
export function shouldReduceDecorativeAnimations() {
  return prefersReducedMotion() || isLowEndDevice();
}

// Check if loading animations should be kept (always keep unless extremely low-end)
export function shouldKeepLoadingAnimations() {
  // Keep loading animations unless device is extremely limited
  if (typeof navigator === "undefined") return true;
  
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 2;
  
  // Only disable loading animations on extremely limited devices
  return !(cores < 1 || memory < 0.5);
}

// Get optimized transition settings based on device/user preferences
export function getOptimizedTransition(baseTransition = transition, isLoadingAnimation = false) {
  // Always allow loading animations unless extremely limited
  if (isLoadingAnimation && shouldKeepLoadingAnimations()) {
    return baseTransition;
  }
  
  if (shouldReduceAnimations()) {
    return { duration: 0.01, ease: "linear" }; // Nearly instant
  }
  
  if (isLowEndDevice()) {
    return { 
      duration: Math.min(baseTransition.duration * 0.7, 0.2), // Faster animations
      ease: "easeOut" // Simpler easing
    };
  }
  
  return baseTransition;
}
