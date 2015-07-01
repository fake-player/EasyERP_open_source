/**
 * Created by soundstorm on 15.06.15.
 */
var express = require('express');
var router = express.Router();
var SalaryHandler = require('../handlers/salary');

module.exports = function (models) {
    var handler = new SalaryHandler(models);

    router.get('/checkDataKey', handler.checkDataKey);
    router.get('/recalculateSalaryCash', handler.recalculateCashSalary);
    router.get('/totalCollectionLength', handler.totalCollectionLength);
    router.get('/:viewType', handler.getForView);
    router.get('/form/:id', handler.getById);
    router.post('/', handler.create);
    router.patch('/', handler.putchBulk);
    router.patch('/:id', handler.putchModel);
    router.delete('/:id', handler.remove);

    return router;
};