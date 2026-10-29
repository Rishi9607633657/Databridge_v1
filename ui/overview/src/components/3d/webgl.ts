/* WebGL availability check (the 2D map is used when it is missing or the 3D scene fails). */
let cached: boolean | null = null;

export function hasWebGL(): boolean {
  if (cached != null) return cached;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    cached = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
