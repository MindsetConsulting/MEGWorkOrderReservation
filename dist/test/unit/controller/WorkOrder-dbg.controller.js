/*global QUnit*/

sap.ui.define([
	"meg/workorder/controller/WorkOrder.controller"
], function (Controller) {
	"use strict";

	QUnit.module("WorkOrder Controller");

	QUnit.test("I should test the WorkOrder controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
