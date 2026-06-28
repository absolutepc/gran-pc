(function bootCatalogReset() {
  try {
    var params = new URLSearchParams(window.location.search);

    if (params.get('pcmarket_reset') === '1') {
      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf('pcmarket_') === 0) localStorage.removeItem(key);
      });
      params.delete('pcmarket_reset');
      var query = params.toString();
      var nextUrl = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
      window.location.replace(nextUrl);
      return;
    }

    [
      'pcmarket_data_v3',
      'pcmarket_data_v6',
      'pcmarket_data_v7',
      'pcmarket_data_v8',
    ].forEach(function (key) {
      localStorage.removeItem(key);
    });
  } catch (error) {
    // localStorage недоступен — пропускаем
  }
})();
