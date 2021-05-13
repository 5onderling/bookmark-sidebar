import { onMessage } from '@chrome/runtime/port';
import { Positions, Themes } from '@shared/consts/settings';
import { $, on } from '@utils/dom';
import { removeBookmark, createBookmark, moveBookmark, changeBookmark } from '@shared/bookmark';
import { newFolder, folderRemoved } from '@shared/settings';
import { root, shadowRoot, sidebar, setSidebar } from '@sidebar-root';
import { port } from '@port';
import { enableResizer } from '@components/resizer';
import { enableBookmarkFeatures } from '@components/bookmark';
import { enableDragAndDrop } from '@components/bookmark/dragAndDrop';
import { enableModal } from '@components/modal';
import { enableSearchbar } from '@components/search';
import { updateActiveIcon } from '@components/bookmark/activeIcon';

/** @param {boolean} [force] */
const toggleSidebarVisibility = (force) => {
  const added = sidebar.classList.toggle(
    'sidebar--invisible',
    typeof force === 'boolean' ? !force : undefined,
  );
  if (added) return;

  updateActiveIcon();
  sidebar.focus();
};

onMessage(port, 'sidebar', ({ bookmarkSidebarHtml }) => {
  shadowRoot.innerHTML = bookmarkSidebarHtml;
  setSidebar();

  onMessage(port, 'toggleSidebarVisibility', toggleSidebarVisibility);
  onMessage(port, 'removeBookmark', removeBookmark);
  onMessage(port, 'createBookmark', createBookmark);
  onMessage(port, 'moveBookmark', moveBookmark);
  onMessage(port, 'changeBookmark', changeBookmark);
  onMessage(port, 'newFolder', newFolder);
  onMessage(port, 'folderRemoved', folderRemoved);

  onMessage(port, 'settingsChanged', (changes) => {
    /** @type {HTMLFormElement} */
    const modalSettings = $('.js-modal-settings');

    if (changes.sidebarShwonBookmark) {
      const main = $('main');
      if (changes.bookmarksHtml) {
        main.innerHTML = changes.bookmarksHtml;
        enableDragAndDrop();
      } else {
        const children = $(`#b${changes.sidebarShwonBookmark} ul`);
        if (children) {
          children.removeAttribute('class');
          children.hidden = false;
          main.innerHTML = '';
          main.append(children);
        }
      }
      sidebar.id = `b${changes.sidebarShwonBookmark}`;
      modalSettings.elements.sidebarShwonBookmark.value = changes.sidebarShwonBookmark;
    }

    if (changes.sidebarPosition) {
      sidebar.classList.toggle('sidebar--left', changes.sidebarPosition === Positions.left);
      modalSettings.elements.sidebarPosition.value = changes.sidebarPosition;
    }

    if (changes.theme) {
      const { oldValue, newValue } = changes.theme;
      if (oldValue !== Themes.system) sidebar.classList.remove(`sidebar--${oldValue}`);
      if (newValue !== Themes.system) sidebar.classList.add(`sidebar--${newValue}`);
      modalSettings.elements.theme.value = newValue;
    }

    if (changes.sidebarWidth) {
      sidebar.style.width = `${changes.sidebarWidth}px`;
      modalSettings.elements.sidebarWidth.value = changes.sidebarWidth;
    }
  });

  on(window, 'click', (event) => !root.contains(event.target) && toggleSidebarVisibility(false));
  on(
    window,
    'blur',
    () => document.activeElement?.tagName === 'IFRAME' && toggleSidebarVisibility(false),
  );
  on('keydown', (event) => event.stopPropagation());

  enableBookmarkFeatures();
  enableResizer();
  enableModal();
  enableSearchbar();

  document.body.append(root);
  toggleSidebarVisibility(true);
});
