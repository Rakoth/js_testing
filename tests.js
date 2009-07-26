/*
 * A simple lib is for javascript testing
 *   author: Alexander Stanko
 *
 * Required:
 *   jQuery methods:
 *     $.extend
 *     $.isArray
 *     $.isFunction
 *
 *   firebug 1.3 (not 1.4) console is for output
 *
 * How to use:
 *   add your groups of tests in TestsGroups hash
 *   and run them:
 *     Tests.run_all();
 *
 *   all tests should be named in accordance with the convention:
 *     test_method_name_should_do_something
 *     'test_' and '_should_' parts are required
 *
 *   add setup method to group for initialize variable
 *     it starts up before each test
 *
 *   use assertions methods which is defined in an object of Tests
 *
 *   see an example at the end of this file
 *
 *-----------------------------------------------------------------*/

var Tests = {
	run_all: function(){
		for(var group in TestsGroups){
			TestsGroups[group].group_title = group + ' Tests';
			$.extend(TestsGroups[group], this);
			TestsGroups[group].run();
		}
	},
	assert: function(assertion, message){
		this._test_assertions++;
		this._group_assertions++;
		if(!assertion){
			this._show_message(message);
			this._test_failed++;
			this._group_failed++;
		}
	},
	assert_equals: function(expected, actual, message){
		if($.isArray(expected) && $.isArray(actual)){
			this._assert_equals_arrays(expected, actual, message);
		}else{
			var assertion = (expected === actual);
			this.assert(assertion, ["assert_equals failed! Actual: %o, expected: %o; ", actual, expected, message || '']);
		}
	},
	assert_false: function(false_assertion, message){
		var assertion = (false === false_assertion);
		this.assert(assertion, ["assert_false failed! Assertion was true; ", message || '']);
	},
	assert_string: function(object, message){
		var assertion = ("string" == typeof object);
		this.assert(assertion, ["assert_string failed! %o was not a string; ", object, message || '']);
	},
	assert_array: function(object, message){
		var assertion = $.isArray(object);
		this.assert(assertion, ["assert_array failed! %o was not an Array; ", object, message || '']);
	},
	assert_instanceof: function(object, expected_class, message){
		var assertion = (object instanceof expected_class);
		this.assert(assertion, ["assert_instanceof failed! %o was not an instance of the expected type; ", object, message || '']);
	},
	assert_undefined: function(object, message){
		var assertion = (undefined === object);
		this.assert(assertion, ["assert_undefined failed! %o was defined; ", object, message || '']);
	},
	assert_defined: function(object, message){
		var assertion = (undefined !== object);
		this.assert(assertion, ["assert_defined failed! variable was undefined; ", message || '']);
	},
	run: function(){
		this._start_tests_group();
		this._init_group_counters();

		for(var test in this){
			if(this._is_test(test)){
				this._setup();
				this._init_test_counters();
				this._start_test(test);
				try{
					this[test]();
				}catch(e){
					this._error(e);
				}
				this._final_test();
			}
		}
		this._final_tests_group();
	},
	// use assert_equals(array_1, array_2) directly
	_assert_equals_arrays: function(expected, actual, message){
		var assertion = false;
		if(expected.length == actual.length){
			assertion = true;
			for(var i = 0; i < expected.length; i++){
				if(expected[i] !== actual[i]){
					assertion = false;
					break;
				}
			}
		}
		this.assert(assertion, ["assert_equals_arrays failed! Actual: %o, expected: %o; ", actual, expected, message || ''])
	},
	_show_message: function(message){
		if(!$.isArray(message)){
			message = ['assertion failed! ' + (message || '')];
		}
		console.error.apply(console, message);
	},
	_init_group_counters: function(){
		this._group_assertions = 0;
		this._group_failed = 0;
		this._group_errors = 0;
	},
	_init_test_counters: function(){
		this._test_assertions = 0;
		this._test_failed = 0;
	},
	_start_tests_group: function(){
		console.log(' ');
		console.group(this.group_title || 'Tests');
		console.time('time');
	},
	_start_test: function(test_name){
		console.group(test_name.replace('test_', '"').replace('_should_', '" should '));
	},
	_final_test: function(){
		if(0 < this._test_failed){
			console.error('assertions: %i, failed: %i', this._test_assertions, this._test_failed);
		}
		console.groupEnd();
	},
	_final_tests_group: function(){
		console.timeEnd('time');
		var log_level = (this._is_errors() ? 'error' : 'info');
		console[log_level]('assertions: %i, failed: %i, errors: %i', this._group_assertions, this._group_failed, this._group_errors);
		console.groupEnd();
	},
	_setup: function(){
		if($.isFunction(this.setup)){
			this.setup();
		}
	},
	_error: function(exception){
		this._group_errors++;
    var message;
		if('object' == typeof exception){
			message = exception.name + ': ' + exception.message + '; line: ' + exception.lineNumber;
		}else{
			message = exception;
		}
		console.warn("Exception raised: \"%s\"", message);
	},
	_is_errors: function(){
		return (0 < this._group_failed || 0 < this._group_errors);
	},
	_is_test: function(method_name){
		return (0 == method_name.indexOf('test_') && $.isFunction(this[method_name]));
	}
};

var TestsGroups = {};

TestsGroups.Main = {
	test_testing_should_be_easy: function(){with(this){
		assert(true);
	}},
	test_you_should_add_more_tests: function(){with(this){
		assert(false);
	}}
};


/*
 * An example
 *
 * Required jQuery
 *
 *-----------------------------------------------------------------*/

// code to testing:

// let me add an extention to jQuery
$.extend({
	compact: function(array){
		var result = [];
		for(var i = 0; i < array.length; i++){
			if(array[i] != null){
				result.push(array[i]);
			}
		}
		return result;
	}
});

var Person = function(first_name, last_name, middle_initial){
	this.first_name = first_name;
	this.last_name = last_name;
	this.middle_initial = middle_initial;
};

Person.prototype = {
	full_name: function(){
		return $.compact([this.first_name, this.middle_initial_with_period(), this.last_name]).join(' ');
	},
	middle_initial_with_period: function(){
		return this.middle_initial ? this.middle_initial + '.' : null;
	}
};

// and tests:

TestsGroups.Extention = {
	test_compact_should_return_an_array_without_null_and_undefined_elements: function(){with(this){
		assert_equals([1, 2, 3], $.compact([1, 2, 3]));
		assert_equals([1, 3], $.compact([1, null, 3]));
		assert_equals(['', 3], $.compact(['', null, 3, undefined]));
		assert_equals([1, 0, false], $.compact([1, null, 0, false]));
		assert_equals([],  $.compact([]));
	}}
};

TestsGroups.Person = {
	setup: function(){
		this.persons = [new Person('John', 'Doe'), new Person('John', 'Doe', 'H'), new Person('John', 'Doe', '')];
	},
	// use with(this){} and call assertions directly
	// call this.assert() in other case
	test_full_name_should_return_a_string: function(){with(this){
		for(index in persons){
			assert_string(persons[index].full_name());
		}
	}},
	test_full_name_should_work_correct_with_middle_initials: function(){with(this){
		assert_equals('John Doe', persons[0].full_name(), 'without middle_initial');
		assert_equals('John H. Doe', persons[1].full_name(), 'with middle_initial');
		assert_equals('John Doe', persons[2].full_name(), 'with blank middle_initial');
	}}
};


// and finaly run tests:

Tests.run_all();

// see output in firebug console!
