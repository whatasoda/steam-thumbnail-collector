import JSZip from 'jszip';
import fetchImage, { getAllImageUrls, AppImage, getPrimaryImageType, ImageFetchMode, ImageType } from './fetch-image';
import { ConfigApps, RgGame } from './types';

export const bindSelect = (select: HTMLSelectElement, emptyItemLabel: string) => {
  select.innerHTML = '';
  const addOption = (value: string, label: string) => {
    const option = document.createElement('option');
    option.value = value;
    option.label = label;
    select.appendChild(option);
  };
  addOption('', emptyItemLabel);
  return { addOption };
};

export const getJsonFromTextarea = <T, U = T>(selector: string, transform: (raw: T) => U) => {
  const textarea = document.querySelector<HTMLTextAreaElement>(selector);
  const jsonText = textarea?.value;
  if (!jsonText) return null;
  try {
    const json = JSON.parse(jsonText) as T;
    return transform(json);
  } catch (e) {
    return null;
  }
};

export const createCategoryMap = (config: ConfigApps) => {
  const categoryMap = new Map<string, string[]>();
  (Object.entries(config) as [string, ConfigApps[keyof ConfigApps]][]).forEach(([appid, { tags }]) => {
    Object.values(tags || {}).forEach((tag) => {
      const categoryItems = categoryMap.get(tag) || [];
      categoryItems.push(appid);
      categoryMap.set(tag, categoryItems);
    });
  });
  return categoryMap;
};

export const filterGamesByCategory = (categoryMap: Map<string, string[]>, targetCategory: string, games: RgGame[]) => {
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
    zip.file(formatName(`${name}.jpg`), image.blob, { binary: true });
  });

  return await zip.generateAsync({ type: 'blob' });
};

export const saveAs = (file: Blob, filename: string) => {
  const anchor = document.createElement('a');
  const url = URL.createObjectURL(file);
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(function () {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }, 0);
};

const formatName = (name: string) => {
  return name.replace(/\s|\//g, '_').replace(/:/g, '').replace(/_+/g, '_');
};
