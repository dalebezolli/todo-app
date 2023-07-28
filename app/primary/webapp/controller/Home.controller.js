sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/StandardListItem",
], function (Controller, Filter, FilterOperator, StandardListItem) {
    "use strict";

    return Controller.extend("com.bezolli.primary.controller.Home", {
        onInit: function() {
            this.getOwnerComponent().getModel().bindList("/Todo", null, null).requestContexts().then(function(aContexts) {
                const aData = aContexts.map(oContext => oContext.getObject());

                const mTodoListDetails = new Map();
                for(const oData of aData) {
                    const oTodoListDetails = mTodoListDetails.get(oData.list_ID) || { total: 0, complete: 0 };
                    oTodoListDetails.total++;
                    if(oData.completed) oTodoListDetails.complete++;
                    console.log(oData.completed);
                    mTodoListDetails.set(oData.list_ID, oTodoListDetails);

                }

                this.byId("list").getAggregation("items").forEach(function(item) {
                    const todoListId = item.getBindingContext().getProperty("ID");
                    const currentTodoListDetails = mTodoListDetails.get(todoListId);
                    console.log(item.setDescription(`Total - ${currentTodoListDetails.total} Complete - ${currentTodoListDetails.complete}`));
                });
                console.log(mTodoListDetails);
            }.bind(this));
        },
        displayDetails: function(oEvent) {
            const oDetails = this.getView().byId("details");            

            // Find the todolist id
            const todoListId = oEvent.getSource().getBindingContext().getProperty("ID");

            // Bind the todolist elements to a list
            oDetails.bindAggregation("items", {
                path: "/Todo",
                filters: new Filter("list_ID", FilterOperator.EQ, todoListId),
                template: new StandardListItem({ title: "{text}" })
            });
        }
    });
});