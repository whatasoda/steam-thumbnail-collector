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

  const categoryMap = createCategoryMap(config);
  const select = document.querySelector<HTMLSelectElement>('#category-select')!;
  const { addOption } = bindSelect(select, 'Choose a category...');
  [...categoryMap.entries()].forEach(([key, { length }]) => {
    addOption(key, `${key} - ${length} items`);
  });

  select.addEventListener('change', (event) => {
    if ((event.currentTarget as HTMLSelectElement).value) {
      generateButton.removeAttribute('disabled');
    }
  });

  const generateButton = document.querySelector<HTMLButtonElement>('#generate')!;
  generateButton.addEventListener('click', () => {
    const category = select.value;
    const selected = filterGamesByCategory(categoryMap, category, games);
    createThumbnailZip(selected).then((zip) => {
      saveAs(zip, `${category}.zip`);
    });
  });
};

document.querySelector<HTMLButtonElement>('#load')?.addEventListener('click', () => {
  init();
});
