import JSZip from 'jszip';
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

export const createThumbnailZip = async (games: RgGame[]) => {
  const promises = games.map(async ({ appid, name }) => {
    try {
      const dataUrl = await loadThumbnailAsDataUrl(appid);
      return { name, dataUrl };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`Failed to load image for ${name}`);
      return null;
    }
  });
  const images = (await Promise.all(promises)).filter(Boolean);

  const zip = new JSZip();
  (images as NonNullable<typeof images[number]>[]).forEach(({ name, dataUrl }) => {
    zip.file(`${name}.jpg`, dataUrl.replace(/^data:image\/jpeg;base64,/, ''), { base64: true });
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

const loadThumbnailAsDataUrl = (appid: number, filename: string = 'capsule_184x69.jpg') => {
  return fetch(`https://cdn.akamai.steamstatic.com/steam/apps/${appid}/${filename}`)
    .then((res) => res.blob())
    .then((blob) => {
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.addEventListener('loadend', () => {
          resolve(reader.result as string);
        });
        reader.readAsDataURL(blob);
      });
    });
};
