sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
  "use strict";

  return {
    callGetData: function (url) {
      return new Promise(function (resolve, reject) {
        $.get({
          "x-csrf-token": fetch,
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

    callPostData: function (url, data) {
      var token = "";
      jQuery.ajax({
        url: url,
        type: "GET",
        accepts: {
          json: "application/json",
        },
        contentType: "application/json",
        // data: data,
        beforeSend: function (xhr) {
          // setRequestHeader("Accept", "application/json; charset=utf-8");
          // xhr.setRequestHeader("Content-Type", "application/json");
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("X-CSRF-Token", "Fetch");
        },
        success: function (responseToken, textStatus, XMLHttpRequest) {
          var token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
          // console.log("token = " + token);
          jQuery.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            // accept: "application/json",
            beforeSend: function (xhr) {
              // setRequestHeader("Accept", "application/json; charset=utf-8");
              xhr.setRequestHeader("Accept", "application/json");
              xhr.setRequestHeader("X-CSRF-Token", token);
            },
            success: function (oData, oResponse, xhr) {
              // will be called once the xsjs file sends a
              // resolve(response);
              // MessageBox.success("Confirmation Saved!");
              var WO = oData.d.WorkOrder;
              var LogNav = oData.d.LogNav;
              if (LogNav == null) {
                MessageBox.information("NO DATA CHANGED!", {
                  styleClass: "alignCenter",
                });
              } else if (LogNav) {
                var errMsg = "";
                LogNav.results.forEach(function (log) {
                  if (log.Type == "E") {
                    errMsg += log.Message + "\n";
                  }
                });
                if (errMsg != "") {
                  MessageBox.error(errMsg.toUpperCase(), {
                    styleClass: "alignCenter",
                  });
                } else {
                  MessageBox.success("ORDER " + WO + " SAVED!", {
                    styleClass: "alignCenter",
                  });
                }
              }
              // else {
              //   MessageBox.success("Confirmation Saved!");
              // }
              console.log(oData, oResponse, xhr);
            },
            error: function (e) {
              // will be called in case of any errors:
              // var errMsg = e.responseText;
              var errMsg = JSON.parse(e.responseText).error.message.value;
              MessageBox.error(errMsg);
              console.log(e, errMsg);
            },
          });
        },
      });
    },
  };
});
