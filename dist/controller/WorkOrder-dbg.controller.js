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

			onValueHelpRequest: function (oEvent) {
				var sInputValue = oEvent.getSource().getValue(),
					oView = this.getView();

				if (!this._pValueHelpDialog) {
					this._pValueHelpDialog = Fragment.load({
						id: oView.getId(),
						name: "sap.m.sample.InputAssisted.ValueHelpDialog",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}
				this._pValueHelpDialog.then(function (oDialog) {
					// Create a filter for the binding
					oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
					// Open ValueHelpDialog filtered by the input's value
					oDialog.open(sInputValue);
				});
			},
		});
	});
