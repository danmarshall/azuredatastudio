/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const path = require('path');
const testRunner = require('../../../../test/integration/electron/testrunner');

const options: any = {
	ui: 'tdd',
	color: true,
	timeout: 60000
};

// These integration tests is being run in multiple environments (electron, web, remote)
// so we need to set the suite name based on the environment as the suite name is used
// for the test results file name
let suite = '';
if (process.env.VSCODE_BROWSER) {
	suite = `${process.env.VSCODE_BROWSER} Browser Integration .ipynb Tests`;
} else if (process.env.REMOTE_VSCODE) {
	suite = 'Remote Integration .ipynb Tests';
} else {
	suite = 'Integration .ipynb Tests';
}

if (process.env.BUILD_ARTIFACTSTAGINGDIRECTORY) {
	options.reporter = 'mocha-multi-reporters';
	options.reporterOptions = {
		reporterEnabled: 'spec, mocha-junit-reporter',
		mochaJunitReporterReporterOptions: {
			testsuitesTitle: `${suite} ${process.platform}`,
			mochaFile: path.join(process.env.BUILD_ARTIFACTSTAGINGDIRECTORY, `test-results/${process.platform}-${process.arch}-${suite.toLowerCase().replace(/[^\w]/g, '-')}-results.xml`)
		}
	};
}

testRunner.configure(options);

export = testRunner;
