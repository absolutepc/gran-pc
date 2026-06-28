(function bootCatalogReset() {
  try {
    var params = new URLSearchParams(window.location.search);

    if (params.get('pcmarket_reset') === '1') {
      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf('pcmarket_') === 0) localStorage.removeItem(key);
      });
      params.delete('pcmarket_reset');
      var query = params.toString();
      window.location.replace(window.location.pathname + (query ? '?' + query : '') + window.location.hash);
      return;
    }

    [
      'pcmarket_data_v3',
      'pcmarket_data_v4',
      'pcmarket_data_v6',
      'pcmarket_data_v7',
      'pcmarket_data_v9',
    ].forEach(function (key) {
      localStorage.removeItem(key);
    });
  } catch (error) {
    // localStorage недоступен
  }
})();
