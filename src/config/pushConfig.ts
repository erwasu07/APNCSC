// CSC DOST — Client Web Push Public Configuration
// Note: Only the VAPID PUBLIC key belongs in client code.
// The VAPID PRIVATE key must remain strictly in server-side environment secrets.

export const VAPID_PUBLIC_KEY = (
  import.meta.env?.VITE_VAPID_PUBLIC_KEY ||
  'BJZxu9aQ0e54Br6OUHQMQbw7Oc1p1FStaxyzuBGISVvfBDp8N4lFPn8tVEZPZeM75TJjbLJHmdsTIkLi7noWlnk'
).trim();
