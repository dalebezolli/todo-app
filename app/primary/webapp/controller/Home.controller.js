sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/StandardListItem",
], function (Controller, Filter, FilterOperator, StandardListItem) {
    "use strict";

    return Controller.extend("com.bezolli.primary.controller.Home", {
        displayDetails: function(oEvent) {
            const oDetails = this.getView().byId("details");            

            // Find the todolist id
            const todoListId = oEvent.getSource().getBindingContext().getProperty("ID");

            // Bind the todolist elements to a list
            oDetails.bindAggregation("items", {
                path: "/Todo",
                filters: [new Filter("list_ID", FilterOperator.EQ, todoListId)],
                template: new StandardListItem({ title: "{text} - {list_ID}" })
            });
        }
    });
});