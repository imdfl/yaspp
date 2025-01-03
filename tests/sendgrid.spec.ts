import { describe, expect, test } from '@jest/globals';
import { validateRequest } from '../src/pages/api/sendgrid';

describe('validateRequest', () => {
	test('should allow normal content', () => {
		const res = validateRequest({
			fullName: 'Ed Nather',
			email: 'nather@astro.as.utexas.edu',
			message: 'Some message',
		});

		expect(res.fullName).toEqual('Ed Nather');
		expect(res.email).toEqual('nather@astro.as.utexas.edu');
		expect(res.message).toEqual('Some message');
	});

	test('should allow maximum length of 100 chars to fullname', () => {
		const invalid = Array(300).fill('X').join('');

		const res = validateRequest({
			fullName: invalid,
			email: 'nather@astro.as.utexas.edu',
			message: 'Some message',
		});

		expect(res.fullName.length).toEqual(100);
	});

	test('should allow maximum length of 256 chars to email address', () => {
		const invalid = Array(300).fill('X').join('');

		const res = validateRequest({
			fullName: 'Ed Nather',
			email: invalid,
			message: 'Some message',
		});

		expect(res.email.length).toEqual(256);
	});

	test('should allow maximum length of 4096 chars to message body', () => {
		const invalid = Array(5000).fill('X').join('');

		const res = validateRequest({
			fullName: 'Ed Nather',
			email: 'nather@astro.as.utexas.edu',
			message: invalid,
		});

		expect(res.message.length).toEqual(4096);
	});
});
