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
                const aTodos = aContexts.map(oContext => oContext.getObject());
                const mTodoListDetails = this._calculateTodoListDetails(aTodos);

                const oTileListContent = this.byId("list").getAggregation("content");
                for(oTile of oTileListContent) {
                    const todoListId = item.getBindingContext().getProperty("ID");
                    const oCurrentTodoListDetails = mTodoListDetails.get(todoListId);
                    item.setSubheader(`Total - ${oCurrentTodoListDetails.total}\nComplete - ${oCurrentTodoListDetails.complete}`);
                }
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
        },
        _calculateTodoListDetails: function(aTodos) {
            const mTodoListDetails = new Map();
            for(const oData of aTodos) {
                const oTodoListDetails = mTodoListDetails.get(oData.list_ID) || { total: 0, complete: 0 };

                oTodoListDetails.total++;
                if(oData.completed) oTodoListDetails.complete++;

                mTodoListDetails.set(oData.list_ID, oTodoListDetails);
            }

            return mTodoListDetails;
        }
    });
});