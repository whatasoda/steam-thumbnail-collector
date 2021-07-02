import filenamify from 'filenamify';
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
  filename: string;
  image: AppImage;
}

export interface FailedAppData {
  failType: 'FALLBACK_FOUND' | 'ALL_NOT_FOUND';
  appid: number;
  name: string;
  filename: string;
  actualType: ImageType | null;
  expectedType: ImageType;
  allImageUrls: Record<ImageType, string>;
}

export interface ProgressInfo {
  image: number;
  zip: number;
}

export const createThumbnailZip = async (
  games: RgGame[],
  fetchMode: ImageFetchMode = 'capsule',
  onProgress?: (info: ProgressInfo) => void,
) => {
  const totalImageCount = games.length;
  let finishedImageCount = 0;
  const progress: ProgressInfo = {
    image: 0,
    zip: 0,
  };

  const images: ImageFileData[] = [];
  const fails: FailedAppData[] = [];
  const promises = games.map(async ({ appid, name }) => {
    const image = await fetchImage(appid, fetchMode);
    const filename = formatFilename(`${name}.jpg`);
    const expectedType = getPrimaryImageType(fetchMode);
    const actualType = image?.type ?? null;
    let failType: FailedAppData['failType'] | null;
    if (image) {
      images.push({ appid, name, filename, image });
      failType = expectedType === image.type ? null : 'FALLBACK_FOUND';
    } else {
      failType = 'ALL_NOT_FOUND';
    }

    if (failType) {
      const allImageUrls = getAllImageUrls(appid);
      fails.push({ failType, appid, name, filename, actualType, expectedType, allImageUrls });
    }
    progress.image = (++finishedImageCount / totalImageCount) * 100;
    onProgress?.({ ...progress });
  });
  await Promise.all(promises);

  const zip = new JSZip();
  images.forEach(({ filename, image }) => {
    zip.file(filename, image.blob, { binary: true });
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' }, ({ percent }) => {
    progress.zip = percent;
    onProgress?.({ ...progress });
  });
  fails.sort(({ failType: a }, { failType: b }) => {
    if (a === b) return 0;
    if (a === 'ALL_NOT_FOUND') return -1;
    if (b === 'ALL_NOT_FOUND') return 1;
    return 0;
  });

  return { zipBlob, fails };
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

export const formatFilename = (filename: string) => {
  return filenamify(filename, { replacement: '_' }).replace(/_+/g, '_');
};
