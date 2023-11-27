sap.ui.define([], function () {
  "use strict";

  return {
    callGetData: function (url) {
      return new Promise(function (resolve, reject) {
        $.get({
          url: url,
          success: function (data) {
            resolve(data);
            sap.ui.core.BusyIndicator.hide();
          },
          error: function (data) {
            reject(data);
            sap.ui.core.BusyIndicator.hide();
          },
        });
      });
    },
  };
});
