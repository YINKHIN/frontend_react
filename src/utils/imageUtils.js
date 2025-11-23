// Use preserved native Image constructor
const NativeImage = window.NativeImage || window.Image;

// Helper function to create native Image objects safely
export const createImage = () => {
    return new NativeImage();
};

// Helper function to preload images
export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = createImage();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// Export the native constructor for other uses
export { NativeImage };
