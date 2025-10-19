export async function loadLottie(url) { 
  const r = await fetch(url); 
  return r.json(); 
}

export function isReducedMotion() { 
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; 
}

