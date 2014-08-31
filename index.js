'use strict';
var exitHook = require('exit-hook');

module.exports = function () {
	exitHook(function () {
		process.stdout.write('\u001b[?25h');
	});
};
