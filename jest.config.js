export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testMatch: ['**/*.spec.ts'],
	restoreMocks: true,
	clearMocks: true,
	setupFilesAfterEnv: ['<rootDir>/test/support/setupFramework.ts'],
	roots: ['<rootDir>/src', '<rootDir>/test'],
	coverageReporters: ['lcov', 'cobertura'],
	coverageDirectory: './temp/jest-coverage',
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/knex/{migrations,seeds}/**',
		'!src/knex/knexfile.ts',
		'!src/types/database/fire.ts',
	],
	reporters: [
		['jest-silent-reporter', { showPaths: true }],
		[
			'jest-junit',
			{
				outputDirectory: './temp/jest-reports',
				suiteNameTemplate: '{filepath}',
				classNameTemplate: '{classname}',
				titleTemplate: '{title}',
				ancestorSeparator: ' › ',
			},
		],
	],
	slowTestThreshold: 6000,
	snapshotFormat: {
		escapeString: true,
		printBasicPrototype: true,
	},
	maxWorkers: 1,
};
