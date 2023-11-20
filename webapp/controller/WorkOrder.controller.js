sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, JSONModel, Fragment, Filter, FilterOperator) {
		"use strict";

		return Controller.extend("meg.workorder.controller.WorkOrder", {
			onInit: function () {

			},

			onTablePress: function (oEvent) {
				var oRouter = this.getOwnerComponent().getRouter();
				var sCompany = this.companyKey;
				var sFacility = this.facilityKey;

				// var oItem = this.getView().byId("CID").getValue();
				var obj = {
					"id": "123",
				};
				oRouter.navTo("RouteObjectPage", {
					// id: JSON.stringify(obj)
					id: "123"
				});
			},

			onSuggestionItemSelected: function (oEvent) {
				var oItem = oEvent.getParameter("selectedItem");
				var oText = oItem ? oItem.getProperty("description") : "";
				// this.byId("selectedKeyIndicator").setText(oText);
				this.getView().getModel("localModel").setProperty("/workOrderValueHelp", oText);
			},

			onWOValueHelp: function (oEvent) {
				var sInputValue = oEvent.getSource().getValue(),
					oView = this.getView();

				// if (!this._pDialog) {
                //     this._pDialog = Fragment.load({
                //         id: oView.getId(),
                //         name: "meg.workorder.fragments.WorkOrder",
                //         controller: this
                //     }).then(function (oDialog) {
                //         oView.addDependent(oDialog);
                //         return oDialog;
                //     });
                // }

				if (!this._oDialog) {
                    // create dialog via fragment factory
                    this._oDialog = sap.ui.xmlfragment("meg.workorder.fragments.WorkOrder", this);
                    // connect dialog to view (models, lifecycle)
                    this.getView().addDependent(this._oDialog);
                    this._oDialog.open();
                }
				this._oDialog.open();

				// this._oDialog.then(function(oDialog) {
				// 	// Create a filter for the binding
				// 	oDialog.getBinding("items").filter([new Filter("WorkOrder", FilterOperator.Contains, sInputValue)]);
				// 	// Open ValueHelpDialog filtered by the input's value
				// 	oDialog.open(sInputValue);
				// });
			}
		});
	});
