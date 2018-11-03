class HelpPopup {
  constructor($dom) {
    this.$view = $dom.find('.popup');
  }

  init() {
    const $view = this.$view;
    const popupShown = BROWSER_STORAGE.get(STORE.POPUP);
    const sidebarVisible = $('html').hasClass(SHOW_CLASS);

    if (popupShown || sidebarVisible) {
      return hideAndDestroy();
    }

    $(document).one(EVENT.TOGGLE, hideAndDestroy);

    setTimeout(() => {
      setTimeout(hideAndDestroy, 6000);
      $view.addClass('show').click(hideAndDestroy);
    }, 500);

    function hideAndDestroy() {
      BROWSER_STORAGE.set(STORE.POPUP, true);
      if ($view.hasClass('show')) {
        $view.removeClass('show').one('transitionend', () => $view.remove());
      } else {
        $view.remove();
      }
    }
  }
}
