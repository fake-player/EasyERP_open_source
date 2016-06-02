﻿define([
        'Backbone',
        'models/wTrackModel',
        'constants'
    ],
    function (Backbone, wTrackModel, CONSTANTS) {
        'use strict';

        var wTrackCollection = Backbone.Collection.extend({
            model       : wTrackModel,
            url         : CONSTANTS.URLS.WTRACK,
            page        : null,
            namberToShow: null,
            viewType    : null,
            contentType : null,

            initialize: function (options) {
                var that = this;

                options = options || {};
                this.viewType = options.viewType || 'list';
                this.startTime = new Date();
                this.namberToShow = options.count || 100;

                if (options && options.url) {
                    this.url = options.url;
                    delete options.url;
                }/* else if (options && options.viewType) {
                    this.url += this.viewType;
                }*/

                this.contentType = options.contentType || 'wTrack';
                this.count = options.count || 100;
                this.page = options.page || 1;
                this.filter = options.filter;

                this.fetch({
                    data   : options,
                    reset  : true,
                    success: function () {
                        that.page++;
                    },
                    error  : function (models, xhr) {
                        if (xhr.status === 401) {
                            Backbone.history.navigate('#login', {trigger: true});
                        }
                        if (xhr.status === 403) {
                            App.render({
                                type   : 'error',
                                message: 'No access'
                            });
                        }
                    }
                });
            },

            showMore: function (options) {
                var that = this;
                var filterObject = options || {};

                filterObject.page = (options && options.page) ? options.page : this.page;
                filterObject.count = (options && options.count) ? options.count : this.namberToShow;
                filterObject.viewType = (options && options.viewType) ? options.viewType : this.viewType;
                filterObject.contentType = (options && options.contentType) ? options.contentType : this.contentType;
                filterObject.filter = options ? options.filter : {};

                if (options && options.contentType && !(options.filter)) {
                    options.filter = {};
                }

                this.fetch({
                    data   : filterObject,
                    waite  : true,
                    success: function (models) {
                        that.page += 1;
                        that.trigger('showmore', models);
                    },
                    error  : function (models, xhr) {
                        App.render({
                            type   : 'error',
                            message: "Some Error."
                        });
                    }
                });
            },

            parse : function (response) {
                return response.data;
            }
        });
        return wTrackCollection;
    });