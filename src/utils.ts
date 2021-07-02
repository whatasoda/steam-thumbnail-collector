import filenamify from 'filenamify/filenamify';
import JSZip from 'jszip';
import fetchImage, { getAllImageUrls, AppImage, getPrimaryImageType, ImageFetchMode, ImageType } from './fetch-image';
import { ConfigApps, RgGame } from './types';

export type CategoryMap = Map<string, string[]>;
export const createCategoryMap = (apps: ConfigApps): CategoryMap => {
  const categoryMap = new Map<string, string[]>();
  (Object.entries(apps) as [string, ConfigApps[keyof ConfigApps]][]).forEach(([appid, { tags }]) => {
    Object.values(tags || {}).forEach((tag) => {
      const categoryItems = categoryMap.get(tag) || [];
      categoryItems.push(appid);
      categoryMap.set(tag, categoryItems);
    });
  });
  return categoryMap;
};

export const filterGamesByCategory = (categoryMap: CategoryMap, targetCategory: string, games: RgGame[]) => {
  const targets = categoryMap.get(targetCategory) || [];
  if (!targets.length) {
    return [] as RgGame[];
  }

  return games.filter(({ appid }) => {
    return targets.includes(`${appid}`);
  });
};

interface ImageFileData {
  appid: number;
  name: string;
  image: AppImage;
}

interface FailedAppData {
  failType: 'FALLBACK_IS_USED' | 'ALL_NOT_FOUND';
  appid: number;
  name: string;
  expectedType: ImageType;
  allImageUrls: Record<ImageType, string>;
}

export const createThumbnailZip = async (games: RgGame[], fetchMode: ImageFetchMode = 'capsule') => {
  const images: ImageFileData[] = [];
  const fails: FailedAppData[] = [];
  const promises = games.map(async ({ appid, name }) => {
    const image = await fetchImage(appid, fetchMode);
    const expectedType = getPrimaryImageType(fetchMode);
    let failType: FailedAppData['failType'] | null;
    if (image) {
      images.push({ appid, name, image });
      failType = expectedType === image.type ? null : 'FALLBACK_IS_USED';
    } else {
      failType = 'ALL_NOT_FOUND';
    }

    if (failType) {
      const allImageUrls = getAllImageUrls(appid);
      fails.push({ failType, appid, name, expectedType, allImageUrls });
    }
  });
  await Promise.all(promises);

  const zip = new JSZip();
  images.forEach(({ name, image }) => {
    zip.file(formatFilename(`${name}.jpg`), image.blob, { binary: true });
  });

  return await zip.generateAsync({ type: 'blob' });
};

export const saveAs = (file: Blob, filename: string) => {
  const anchor = document.createElement('a');
  const url = URL.createObjectURL(file);
  anchor.href = url;
  anchor.download = formatFilename(filename);
  document.body.appendChild(anchor);
  anchor.click();
  return new Promise<void>((resolve) => {
    setTimeout(function () {
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      resolve();
    }, 0);
  });
};

const formatFilename = (filename: string) => {
  return filenamify(filename, { replacement: '_' }).replace(/_+/g, '_');
};
