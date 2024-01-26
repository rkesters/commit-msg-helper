import yargs from 'yargs';
//import path from 'node:path';
import fs from 'fs-extra';

function shouldSkip(
	branchName: string,
	skipBranches: string[] | (string | number)[],
	goodSkips: boolean,
): boolean {
	if (!goodSkips) {
		return true;
	}
	return skipBranches
		.map((s) => new RegExp(`${s}`))
		.some((r) => {
			const result = r.exec(branchName);
			return result && result.length > 0;
		});
}

type BranchParts = {
	reference: string;
	type: string;
	scope: string;
	user: string;
	tag: string;
};

function buildHeader(
	headerTemplate: string,
	parts: Record<string, string>,
): string {
	let headerT = `${headerTemplate}`;
	if (headerTemplate.includes('{scope}') && (!parts.scope || !parts.type)) {
		headerT = headerT.replace('({scope})', '');
	}
	if (headerT.includes('{type}') && !parts.type) {
		headerT = headerT.replace(' {type}', '');
	}
	if (parts.reference) {
		headerT = headerT.replace('{reference}', parts.reference);
	}
	if (parts.type) {
		headerT = headerT.replace('{type}', parts.type);
	}
	if (parts.scope) {
		headerT = headerT.replace('{scope}', parts.scope);
	}
	if (parts.user) {
		headerT = headerT.replace('{user}', parts.user);
	}
	if (parts.tag) {
		headerT = headerT.replace('{tag}', parts.tag);
	}
	headerT = headerT.replaceAll('<', '');
	headerT = headerT.replaceAll('>', '');
	return headerT;
}

type CommitMessageInfo = {
	header: string;
	body: string | undefined;
	footer: string | undefined;
};
type CommitMessageInfoDetailed = {
	header: string;
	body: string | undefined;
	footer: string | undefined;
	bodyLines: string[];
};

function decomposeMessage(message: string): CommitMessageInfo {
	const parts = message.split(/\n/);
	if (!parts) {
		return {
			header: message,
			body: undefined,
			footer: undefined,
		};
	}

	const sections = parts
		.map((p) => p.trim())
		.reduce(
			(acc, p) => {
				const currentSection = acc.length - 1;
				if (p) {
					if (acc[currentSection]) {
						acc[currentSection] = `${acc[currentSection]}\n${p}`;
					} else {
						acc[currentSection] = p;
					}
					return acc;
				}
				acc.push('');
				return acc;
			},
			[''] as string[],
		);

	const info = sections.reduce(
		(acc, section, i, sections) => {
			const len = sections.length;
			if (i == 0) {
				acc.header = section;
				return acc;
			}
			if (i === len - 1 && len >= 3) {
				acc.footer = section;
				return acc;
			}
			if (section) {
				acc.body = section;
				acc.bodyLines.push(section);
				return acc;
			}
			return acc;
		},
		{ bodyLines: [] as string[] } as CommitMessageInfoDetailed,
	);

	if (info.bodyLines.length > 1) {
		info.body = info.bodyLines.join('\n\n');
		delete (info as Partial<CommitMessageInfoDetailed>).bodyLines;
	}
	return info as CommitMessageInfo;
}

function main() {
	const args = yargs(process.argv.slice(2)).options({
		s: {
			type: 'array',
			demandOption: false,
			default: ['^master$', '^main$', '^dev$', '^version/bump.*$'],
			alias: 'skip-branch',
		},
		r: {
			type: 'boolean',
			demandOption: false,
			default: false,
			alias: 'ref-in-footer',
		},
		f: { type: 'string', demandOption: true, alias: 'commit-msg-filename' },
		b: { type: 'string', demandOption: true, alias: 'branch-name' },
		d: {
			type: 'string',
			demandOption: false,
			alias: 'commit-msg-dir',
			default: `${process.cwd()}`,
		},
		p: {
			type: 'string',
			demandOption: false,
			alias: 'pattern',
			default:
				'^(?<user>\\w+)\\/(?<reference>[A-Za-z0-9\\-]+)(%(?<type>\\w+!*)(-(?<scope>[\\w,]+)){0,1}){0,1}(#(?<tag>.*)){0,1}$',
		},
		h: {
			type: 'string',
			demandOption: false,
			alias: 'header',
			default: '[{reference}] {type}({scope}): ',
		},
	});
	const argv = args.parseSync();

	const goodSkips = !(!argv.s.every((b) => !!b) && argv.s.length > 1);

	if (!goodSkips) {
		console.error(`Error: incorrectly specified branches to skip`);
		args.showHelp();
		process.exit(1);
	}

	if (shouldSkip(argv.b, argv.s, goodSkips)) {
		console.info(`Skipping Branch`);
		process.exit(0);
	}

	const filenamePath = `${argv.d}/${argv.f}`;

	fs.ensureFileSync(filenamePath);

	const re = new RegExp(argv.p, 'gm');

	const branchParts = re.exec(argv.b); // argv.b.match(re);

	if (!branchParts || !branchParts.groups) {
		console.error('Unable to decode branch name into parts');
		process.exit(1);
	}
	const message = fs.readFileSync(filenamePath).toString();

	const header = buildHeader(argv.h, branchParts.groups);

	const info = decomposeMessage(message);

	if (info.header.startsWith(header) && !argv.r) {
		console.debug(`Commit message already fixxed up`);
		process.exit(0);
	}

	if (info.header.includes(':')) {
		info.header = info.header.split(':', 2)[1].trim();
	}

	if (argv.r) {
		if (!info.footer?.includes(branchParts.groups.reference)) {
			if (info.footer) {
				info.footer = `${info.footer}\n${branchParts.groups.reference}`;
			} else {
				info.footer = branchParts.groups.reference;
			}
		}
	}

	info.header = `${header}${info.header}`;
	let msg = info.header;

	if (info.body) {
		msg = `${msg}\n\n${info.body}`;
	}

	if (info.footer && !info.body) {
		msg = `${msg}\n`;
	}

	if (info.footer) {
		msg = `${msg}\n\n${info.footer}`;
	}

	fs.writeFileSync(filenamePath, msg);
}

main();
