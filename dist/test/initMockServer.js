sap.ui.define(["../localService/mockserver","sap/m/MessageBox"],function(e,i){"use strict";var r=[];r.push(e.init());Promise.all(r).catch(function(e){i.error(e.message)}).finally(function(){sap.ui.require(["sap/ui/core/ComponentSupport"])})});
//# sourceMappingURL=initMockServer.js.map