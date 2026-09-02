window.MAYOR_IMAGES=window.MAYOR_IMAGES||{};
// Female mayor popup fallback: use the already validated female mayor image.
// This avoids the broken split popup image that failed to render on some iPhone browsers.
MAYOR_IMAGES.popupFemale=MAYOR_IMAGES.iconFemale;
try{delete window.__imgpf;}catch(e){window.__imgpf=null;}
