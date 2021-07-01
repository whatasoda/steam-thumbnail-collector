{
  (function collectGameData() {
    /** @type {import('./src/types').RgGame[]} */
    const source = rgGames;
    const games = source.map(({ appid, name, name_escaped }) => ({ appid, name, name_escaped }));
    const textarea = document.createElement('textarea');
    textarea.value = JSON.stringify(games);
    textarea.style.width = '100%';
    textarea.style.height = '150px';
    const mainContainer = document.querySelector('#mainContents');
    mainContainer.insertBefore(textarea, mainContainer.firstChild);
    textarea.select();
    document.execCommand('copy');
    setTimeout(() => {
      alert('Copied game data to clipboad!');
    }, 10);
  })();
}
