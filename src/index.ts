import { ConfigApps, RgGame, UserRoamingConfigStore } from './types';
import {
  bindSelect,
  createCategoryMap,
  createThumbnailZip,
  filterGamesByCategory,
  getJsonFromTextarea,
  saveAs,
} from './utils';

const init = () => {
  const games = getJsonFromTextarea<RgGame[]>('#games', (data) => data);
  const config = getJsonFromTextarea<UserRoamingConfigStore, ConfigApps>(
    '#sharedconfig',
    (data) => data?.UserRoamingConfigStore?.Software?.Valve?.Steam?.Apps,
  );

  if (!config) {
    alert('Something wrong happened with sharedconfig');
    return;
  }

  if (!games) {
    alert('Something wrong happened with game data from steam profile page');
    return;
  }

  const categorySelect = document.querySelector<HTMLSelectElement>('#category-select')!;
  const imageTypeSelect = document.querySelector<HTMLSelectElement>('#image-type-select')!;

  const categoryMap = createCategoryMap(config);
  const { addOption } = bindSelect(categorySelect, 'All');
  [...categoryMap.entries()].forEach(([key, { length }]) => {
    addOption(key, `${key} - ${length} items`);
  });

  // categorySelect.addEventListener('change', (event) => {
  //   if ((event.currentTarget as HTMLSelectElement).value) {
  //     generateButton.removeAttribute('disabled');
  //   }
  // });

  const generateButton = document.querySelector<HTMLButtonElement>('#generate')!;
  generateButton.removeAttribute('disabled');
  generateButton.addEventListener('click', () => {
    const category = categorySelect.value;
    const selected = category ? filterGamesByCategory(categoryMap, category, games) : games;
    const imageType = imageTypeSelect.value;

    createThumbnailZip(selected, imageType as any).then((zip) => {
      saveAs(zip, `${category || 'all'}.zip`);
    });
  });
};

document.querySelector<HTMLButtonElement>('#load')?.addEventListener('click', () => {
  init();
});
