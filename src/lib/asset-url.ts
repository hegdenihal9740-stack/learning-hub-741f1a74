// Local Vite has no Lovable asset proxy; use the project's asset-serving origin there.
export function assetUrl(path: string, local = import.meta.env.DEV) {
  return local && path.startsWith('/__l5e/assets-v1/')
    ? `https://id-preview--fac1836f-d1d4-4bd0-af55-9eba668c2c62.lovable.app${path}`
    : path;
}