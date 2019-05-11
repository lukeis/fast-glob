import * as assert from 'assert';
import * as path from 'path';

import { Task } from '../managers/tasks';
import Settings, { Options } from '../settings';
import * as tests from '../tests';
import * as utils from '../utils/index';
import Reader from './reader';

export class TestReader extends Reader<Array<{}>> {
	public read(_task: Task): Array<{}> {
		return [];
	}
}

export function getReader(options?: Options): TestReader {
	const settings = new Settings(options);

	return new TestReader(settings);
}

describe('Providers → Reader', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof Reader);
		});
	});

	describe('.getRootDirectory', () => {
		it('should return root directory for reader with global base (.)', () => {
			const reader = getReader();

			const expected = process.cwd();

			const actual = reader.getRootDirectory({ base: '.' } as Task);

			assert.strictEqual(actual, expected);
		});

		it('should return root directory for reader with non-global base (fixtures)', () => {
			const reader = getReader();

			const expected = path.join(process.cwd(), 'fixtures');

			const actual = reader.getRootDirectory({ base: 'fixtures' } as Task);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getReaderOptions', () => {
		it('should return options for reader with global base (.)', () => {
			const reader = getReader();

			const actual = reader.getReaderOptions({
				base: '.',
				dynamic: true,
				patterns: ['**/*'],
				positive: ['**/*'],
				negative: []
			});

			assert.strictEqual(actual.basePath, '');
			assert.strictEqual(actual.sep, '/');
			assert.strictEqual(typeof actual.filter, 'function');
			assert.strictEqual(typeof actual.deep, 'function');
		});

		it('should return options for reader with non-global base (fixtures)', () => {
			const reader = getReader();

			const actual = reader.getReaderOptions({
				base: 'fixtures',
				dynamic: true,
				patterns: ['**/*'],
				positive: ['**/*'],
				negative: []
			});

			assert.strictEqual(actual.basePath, 'fixtures');
			assert.strictEqual(actual.sep, '/');
			assert.strictEqual(typeof actual.filter, 'function');
			assert.strictEqual(typeof actual.deep, 'function');
		});
	});

	describe('.getMicromatchOptions', () => {
		it('should return options for micromatch', () => {
			const reader = getReader();

			const expected: micromatch.Options = {
				dot: false,
				matchBase: false,
				nobrace: false,
				nocase: false,
				noext: false,
				noglobstar: false
			};

			const actual = reader.getMicromatchOptions();

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.transform', () => {
		describe('The «markDirectories» option', () => {
			it('should return mark directory when option is enabled', () => {
				const reader = getReader({ markDirectories: true });
				const entry = tests.getDirectoryEntry();

				const expected = 'fixtures/directory/';

				const actual = reader.transform(entry);

				assert.strictEqual(actual, expected);
			});

			it('should return mark directory when option is enabled with the absolute option enabled', () => {
				const reader = getReader({ markDirectories: true, absolute: true });
				const entry = tests.getDirectoryEntry();

				const fullpath = path.join(process.cwd(), 'fixtures/directory/');
				const expected = utils.path.normalize(fullpath);

				const actual = reader.transform(entry);

				assert.strictEqual(actual, expected);
			});

			it('should do nothing with file when option is enabled', () => {
				const reader = getReader({ markDirectories: true });
				const entry = tests.getFileEntry();

				const expected = 'fixtures/file.txt';

				const actual = reader.transform(entry);

				assert.strictEqual(actual, expected);
			});

			it('should return non-marked directory when option is disabled', () => {
				const reader = getReader();
				const entry = tests.getDirectoryEntry();

				const expected = 'fixtures/directory';

				const actual = reader.transform(entry);

				assert.strictEqual(actual, expected);
			});
		});

		describe('The «absolute» option', () => {
			it('should return transformed entry when option is provided', () => {
				const reader = getReader({ absolute: true });
				const entry = tests.getFileEntry();

				const fullpath = path.join(process.cwd(), 'fixtures/file.txt');
				const expected = utils.path.normalize(fullpath);

				const actual = reader.transform(entry);

				assert.strictEqual(actual, expected);
			});

			it('should return do nothing when option is not provided', () => {
				const reader = getReader();
				const entry = tests.getFileEntry();

				const expected = 'fixtures/file.txt';

				const actual = reader.transform(entry);

				assert.strictEqual(actual, expected);
			});
		});

		describe('The «transform» option', () => {
			it('should return transformed entry when option is provided', () => {
				const reader = getReader({ transform: () => 'cake' });
				const entry = tests.getDirectoryEntry();

				const expected = 'cake';

				const actual = reader.transform(entry);

				assert.strictEqual(actual, expected);
			});

			it('should return do nothing when option is not provided', () => {
				const reader = getReader();
				const entry = tests.getDirectoryEntry();

				const expected = 'fixtures/directory';

				const actual = reader.transform(entry);

				assert.strictEqual(actual, expected);
			});
		});
	});

	describe('.isEnoentCodeError', () => {
		it('should return true for ENOENT error', () => {
			const reader = getReader();

			const error = new tests.EnoentErrnoException();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(actual);
		});

		it('should return false for non-ENOENT error', () => {
			const reader = getReader();

			const error = new Error();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(!actual);
		});
	});
});
