/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , EmployeeProvider = require('./employeeprovider').EmployeeProvider;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var employeeProvider= new EmployeeProvider('localhost', 27017);

//Routes

app.get('/', function(req, res){
  employeeProvider.findAll(function(error, emps){
      res.render('index', {
            title: 'Employees',
            employees:emps
        });
  });
});

app.get('/employee/new', function(req, res) {
    res.render('employee_new', {
        title: 'New Employee'
    });
});

//update an employee
app.get('/employee/:id/edit', function(req, res) {
        employeeProvider.findById(req.param('_id'), function(error, employee) {
                res.render('employee_edit',
                { 
                        employee: employee
                });
        });
});

//save updated employee
app.post('/employee/:id/edit', function(req, res) {
        employeeProvider.update(req.param('_id'),{
                title: req.param('title'),
                name: req.param('name')
        }, function(error, docs) {
                res.redirect('/')
        });
});

//save new employee
app.post('/employee/new', function(req, res){
    employeeProvider.save({
        title: req.param('title'),
        name: req.param('name')
    }, function( error, docs) {
        res.redirect('/')
    });
});

//find an employee by ID
EmployeeProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, employee_collection) {
      if( error ) callback(error)
      else {
        employee_collection.findOne({_id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

// update an employee
EmployeeProvider.prototype.update = function(employeeId, employees, callback) {
    this.getCollection(function(error, employee_collection) {
      if( error ) callback(error);
      else {
        employee_collection.update(
                                        {_id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(employeeId)},
                                        employees,
                                        function(error, employees) {
                                                if(error) callback(error);
                                                else callback(null, employees)       
                                        });
      }
    });
};
//delete an employee
app.post('/employee/:id/delete', function(req, res) {
        employeeProvider.delete(req.param('_id'), function(error, docs) {
                res.redirect('/')
        });
});
app.listen(3000);