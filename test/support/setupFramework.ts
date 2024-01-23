import * as nock from 'nock';

nock.back.setMode(
	(process.env.JEST_NOCK_RECORD ?? 'lockdown') as nock.BackMode,
);
