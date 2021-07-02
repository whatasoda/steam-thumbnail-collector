export interface AppImage {
  blob: Blob;
  type: ImageType;
}

export type ImageFetchMode = ImageType | ImageFallbackType;
export type ImageType = keyof typeof imageTypes;
export type ImageFallbackType = `${ImageType}-fallback`;

const imageTypes = {
  capsule: 'capsule_184x69.jpg',
  header: 'header.jpg',
  library: 'library_600x900.jpg',
};

const fallbacks: Record<ImageFallbackType, ImageType[]> = {
  'capsule-fallback': ['capsule'],
  'header-fallback': ['header', 'capsule'],
  'library-fallback': ['library', 'header', 'capsule'],
};

export default function fetchImage(appid: number, mode: ImageFetchMode): Promise<AppImage | null> {
  if (isFallbackImageFetchMode(mode)) {
    return fetchImageWithFallback(appid, mode);
  } else {
    return fetchImageOnce(appid, mode);
  }
}

export const isFallbackImageFetchMode = (mode: ImageFetchMode): mode is ImageFallbackType => {
  return mode.endsWith('-fallback');
};

export const getPrimaryImageType = (mode: ImageFetchMode): ImageType => {
  return mode.replace(/-fallback$/, '') as ImageType;
};

export const fetchImageWithFallback = async (appid: number, fallbackType: ImageFallbackType) => {
  return fallbacks[fallbackType].reduce<Promise<AppImage | null>>(async (prev, type) => {
    return (await prev) || (await fetchImageOnce(appid, type));
  }, Promise.resolve(null));
};

export const fetchImageOnce = (appid: number, type: ImageType): Promise<AppImage | null> => {
  return fetch(imageUrl(appid, type))
    .then((res) => res.blob())
    .then((blob) => ({ blob, type }))
    .catch(() => null);
};

export const getAllImageUrls = (appid: number): Record<ImageType, string> => ({
  capsule: imageUrl(appid, 'capsule'),
  header: imageUrl(appid, 'header'),
  library: imageUrl(appid, 'library'),
});

export const imageUrl = (appid: number, type: ImageType) => {
  const filename = imageTypes[type];
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/${filename}`;
};
