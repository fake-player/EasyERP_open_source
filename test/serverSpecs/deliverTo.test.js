var request = require('supertest');
var expect = require('chai').expect;
var url = 'http://localhost:8089/';
var aggent;

require('../../config/development');

describe('DeliverTo Specs', function () {
    'use strict';

    describe('DeliverTo with admin', function () {

        before(function (done) {
            aggent = request.agent(url);
            aggent
                .post('users/login')
                .send({
                    login: 'admin',
                    pass : 'tm2016',
                    dbId : 'production'
                })
                .expect(200, done);
        });

        after(function (done) {
            aggent
                .get('logout')
                .expect(302, done);
        });

        it('should get deliverTo for Dd', function (done) {

            aggent
                .get('deliverTo')
                .expect(200)
                .end(function (err, res) {
                    var body = res.body;

                    if (err) {
                        return done(err);
                    }

                    expect(body)
                        .to.be.instanceOf(Object);
                    expect(body)
                        .to.have.property('data')
                        .and.to.be.instanceOf(Array);

                    done();
                });
        });

    });

    describe('DeliverTo with no authorise', function () {

        it('should fail get DeliverTo for Dd', function (done) {

            aggent
                .get('deliverTo')
                .expect(404, done);
        });

    });

});

