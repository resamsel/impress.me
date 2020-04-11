/**
 * Navigation UI Icons plugin
 *
 * This plugin provides icons for "back", "forward"
 *
 * Copyright 2020 René Panzar (@resamsel)
 * Released under the MIT license.
 */
(function (document) {
  'use strict';
  document.addEventListener('impress:toolbar:appendChild', function (event) {
    const element = event.detail.element;
    switch (element.id) {
    case 'impress-navigation-ui-prev':
      element.innerHTML = '<span class="material-icons">skip_previous</span>';
      break;
    case 'impress-navigation-ui-next':
      element.innerHTML = '<span class="material-icons">skip_next</span>';
      break;
    }
  }, false);
})(document);
