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
      // return new Promise(function (resolve, reject) {
      //   jQuery.ajax({
      //     url: url,
      //     type: "GET",
      //     // data: data,
      //     beforeSend: function (xhr) {
      //       xhr.setRequestHeader("X-CSRF-Token", "Fetch");
      //     },
      //     success: function (responseToken, textStatus, XMLHttpRequest) {
      //       token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
      //       console.log("token = " + token);
      //       $.post({
      //         "X-CSRF-Token": token,
      //         type: "POST",
      //         url: url,
      //         contentType: "application/json",
      //         data: JSON.stringify(data),
      //         async: true,
      //         success: function (response) {
      //           resolve(response);
      //         }.bind(this),
      //         error: function (response) {
      //           reject(response);
      //         },
      //       });
      //     },
      //   });

      //   // $.post({
      //   //   "X-CSRF-Token": token,
      //   //   type: "POST",
      //   //   url: url,
      //   //   contentType: "application/json",
      //   //   data: JSON.stringify(data),
      //   //   async: true,
      //   //   success: function (response) {
      //   //     resolve(response);
      //   //   }.bind(this),
      //   //   error: function (response) {
      //   //     reject(response);
      //   //   },
      //   // });
      // });

      jQuery.ajax({
        url: url,
        type: "GET",
        // data: data,
        beforeSend: function (xhr) {
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
            accept: "application/json",
            beforeSend: function (xhr) {
              xhr.setRequestHeader("X-CSRF-Token", token);
            },
            success: function (oData, oResponse, xhr) {
              // will be called once the xsjs file sends a
              // resolve(response);
              console.log(oData, oResponse, xhr);
            },
            error: function (e) {
              // will be called in case of any errors:
              var errMsg = e.responseText;
              var message = JSON.parse(e.responseText).error.message;
              // MessageBox.error(e);
              console.log(e, message);
            },
          });
        },
      });
    },
  };
});
