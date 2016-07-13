define([
    'Backbone',
    'Underscore',
    'text!templates/Deals/form/FormTemplate.html',
    'text!templates/Deals/workflowProgress.html',
    'views/Notes/NoteView',
    'views/Deals/EditView',
    'constants',
    'dataService',
    'populate',
    'constants',
    'views/selectView/selectView'
], function (Backbone, _, OpportunitiesFormTemplate, workflowProgress, NoteView, EditView, constants, dataService, populate, CONSTANTS, SelectView) {
    var FormOpportunitiesView = Backbone.View.extend({
        el: '#content-holder',

        initialize: function (options) {
            this.formModel = options.model;
            this.formModel.urlRoot = constants.URLS.OPPORTUNITIES;
        },

        events: {
            click                                                        : 'hideNewSelect',
            'click #tabList a'                                           : 'switchTab',
            'mouseenter .editable:not(.quickEdit)'                       : 'quickEdit',
            'mouseleave .editable'                                       : 'removeEdit',
            'click #editSpan'                                            : 'editClick',
            'click #cancelSpan'                                          : 'cancelClick',
            'click #saveSpan'                                            : 'saveClick',
            'click #workflowProgress span'                               : 'changeWorkflow',
            'click .current-selected:not(.jobs)'                         : 'showNewSelect',
            'click .newSelectList li:not(.miniStylePagination)'          : 'chooseOption'
        },

        hideNewSelect: function () {
            this.$el.find('.newSelectList').hide();

            if (this.selectView) {
                this.selectView.remove();
            }
        },

        saveClick: function (e) {
            e.preventDefault();

            var parent = $(e.target).parent().parent();
            var field = parent.attr('data-id').replace('_', '.');
            var value = this.$el.find('#editInput').val();
            var newModel = {};
            newModel[field] = value;

            parent.text(value);
            parent.removeClass('quickEdit');

            this.saveDeal(newModel);
        },


        cancelClick: function (e) {
            e.preventDefault();

            var parent = $(e.target).parent().parent();
            parent.removeClass('quickEdit');
            parent.text(this.text);
        },

        showNewSelect: function (e) {
            var $target = $(e.target);

            e.stopPropagation();

            if ($target.attr('id') === 'selectInput') {
                return false;
            }

            if (this.selectView) {
                this.selectView.remove();
            }

            this.selectView = new SelectView({
                e          : e,
                responseObj: this.responseObj
            });

            $target.append(this.selectView.render().el);

            return false;
        },

        removeEdit: function () {
            $('#editSpan').remove();
            $('dd .no-long').css({width: 'auto'});
        },

        quickEdit: function (e) {
            var trId = $(e.target);
            if (trId.find('#editSpan').length === 0) {
                trId.append('<span id="editSpan" class=""><a href="javascript:;">e</a></span>');
            }
        },

        editClick: function (e) {
            var maxlength = $('#' + $(e.target).parent().parent()[0].id).find('.no-long').attr('data-maxlength') || 32;
            var parent;

            e.preventDefault();

            $('.quickEdit #editInput').remove();
            $('.quickEdit #cancelSpan').remove();
            $('.quickEdit #saveSpan').remove();
            $('.quickEdit').text(this.text).removeClass('quickEdit');

            parent = $(e.target).parent().parent();
            parent.addClass('quickEdit');
            $('#editSpan').remove();
            this.text = parent.text();
            parent.text('');
            parent.append('<input id="editInput" maxlength="' + maxlength + '" type="text" class="left"/>');
            $('#editInput').val(this.text);
            parent.append('<span id="saveSpan"><a href="#">c</a></span>');
            parent.append('<span id="cancelSpan"><a href="#">x</a></span>');
            parent.find('#editInput').width(parent.find('#editInput').width() - 50);
        },

        changeWorkflow : function (e){
            var $target = $(e.target);
            var $thisEl = this.$el;
            var wId = $target.attr('data-id');
            var $workflows = $thisEl.find('#workflowProgress span');
            $workflows.removeClass('passed');
            $thisEl.find('#workflowProgress span[data-id="' + wId + '"]').prevAll().addClass('passed');
            $target.addClass('passed');
            $thisEl.find('#statusDd').text($target.text());
            workflows = $workflows.get();
            this.saveDeal({workflow : wId});
        },

        chooseOption: function (e) {
            var $target = $(e.target);
            var holder = $target.parents('dd').find('.current-selected');
            var type = $target.closest('a').attr('data-id');
            var id = $target.attr('id');
            var changedObject ={};

            holder.text($target.text());
            changedObject[type] = id;


            if (holder.attr('id') === 'customerDd') {
                this.selectCustomer(id);
            } else {
                this.saveDeal(changedObject);
            }
        },

        selectCustomer: function (id) {
            var self = this;
            var $thisEl = this.$el;
            dataService.getData(CONSTANTS.URLS.CUSTOMERS, {
                id: id
            }, function (response) {
                var customer = response;
                self.formModel.set({customer : customer});

                $thisEl.find('[data-id="email"]').text(customer.email);
                $thisEl.find('[data-id="phones_phone"]').text(customer.phones.phone);
                $thisEl.find('[data-id="phones_mobile"]').text(customer.phones.mobile);
                $thisEl.find('[data-id="address_street"]').text(customer.address.street);
                $thisEl.find('[data-id="address_city"]').text(customer.address.city);
                $thisEl.find('[data-id="address_state"]').text(customer.address.state);
                $thisEl.find('[data-id="address_zip"]').text(customer.address.zip);
                $thisEl.find('[data-id="address_country"]').text(customer.address.country);

                self.saveDeal({
                    customer : customer._id,
                    email :customer.email,
                "phones.phone" : customer.phones.phone,
                "phones.mobile" : customer.phones.mobile,
                "address.street" : customer.address.street,
                "address.city" : customer.address.city,
                "address.state" : customer.address.state,
                "address.zip" : customer.address.zip,
                "address.country" : customer.address.country
                });
            }, this);

        },

        saveDeal : function (changedAttrs){
            this.formModel.save(changedAttrs, {
                patch  : true,
                success: function (model) {

                },

                error: function (model, response) {
                    if (response) {
                        App.render({
                            type   : 'error',
                            message: response.error
                        });
                    }
                }
            });
        },

        editItem: function () {
            // create editView in dialog here
            return new EditView({model: this.formModel});
        },

        deleteItems: function () {
            var mid = 39;

            this.formModel.destroy({
                headers: {
                    mid: mid
                },
                success: function () {
                    Backbone.history.navigate('#easyErp/Deals/kanban', {trigger: true});
                }
            });

        },
        render: function () {
            var formModel = this.formModel.toJSON();
            var self = this;

            this.$el.html(_.template(OpportunitiesFormTemplate, formModel));

            dataService.getData('/workflows/', {id: 'Deals'}, function (response){
                self.responseObj = {workflows : response.data};
                self.$el.find('#workflowProgress').append(_.template(workflowProgress, {workflows : self.responseObj.workflows, workflow : formModel.workflow  }));

            });
            dataService.getData('/opportunities/priority', {}, function (priorities) {
                priorities = _.map(priorities.data, function (priority) {
                    priority.name = priority.priority;

                    return priority;
                });
                self.responseObj['#priorityDd'] = priorities;
            });
            populate.get2name('#customerDd', CONSTANTS.URLS.CUSTOMERS, {type : 'Company'}, this, false, true);
            dataService.getData('/employees/getForDD', {isEmployee: true}, function (employees) {
                employees = _.map(employees.data, function (employee) {
                    employee.name = employee.name.first + ' ' + employee.name.last;

                    return employee;
                });

                self.responseObj['#salesPersonDd'] = employees;
            });
            this.$el.find('.notes').append(
                new NoteView({
                    model: this.formModel,
                    contentType: 'opportunities'
                }).render().el
            );

            return this;
        }
    });

    return FormOpportunitiesView;
});
