import test from 'node:test';
import assert from 'node:assert/strict';

import {
  checkMaliciousPatterns,
  validateEmail,
  validateInput,
  validateInteger,
  validatePhoneNumber,
  validateString,
} from '../src/middleware/inputValidation.js';

test('validateEmail accepts normal addresses and rejects invalid values', () => {
  assert.equal(validateEmail('developer@example.com'), true);
  assert.equal(validateEmail(' developer@example.com '), true);
  assert.equal(validateEmail('invalid-address'), false);
  assert.equal(validateEmail(undefined), false);
});

test('validatePhoneNumber accepts supported formatting and rejects empty text', () => {
  assert.equal(validatePhoneNumber('+66 (81) 234-5678'), true);
  assert.equal(validatePhoneNumber('0812345678'), true);
  assert.equal(validatePhoneNumber(''), false);
  assert.equal(validatePhoneNumber('phone-me'), false);
});

test('validateString enforces type and length boundaries', () => {
  assert.equal(validateString('abc', 3, 5), true);
  assert.equal(validateString('ab', 3, 5), false);
  assert.equal(validateString(123, 1, 5), false);
});

test('validateInteger accepts only positive whole numbers', () => {
  assert.equal(validateInteger(12), true);
  assert.equal(validateInteger('12'), true);
  assert.equal(validateInteger('12abc'), false);
  assert.equal(validateInteger(0), false);
  assert.equal(validateInteger(-2), false);
  assert.equal(validateInteger(2.5), false);
});

test('validateInput trims strings and removes HTML/script tags', () => {
  const req = { body: { name: '  <b>Khant</b>  ', bio: '<script>bad()</script>Hello' } };
  let called = false;

  validateInput(req, {}, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.body.name, 'Khant');
  assert.equal(req.body.bio, 'Hello');
});

test('checkMaliciousPatterns rejects injection keywords and permits normal text', () => {
  let statusCode;
  let payload;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      payload = value;
      return this;
    },
  };

  checkMaliciousPatterns(
    { body: { query: 'DROP TABLE users' }, ip: '127.0.0.1' },
    res,
    () => assert.fail('malicious input must not call next'),
  );
  assert.equal(statusCode, 400);
  assert.equal(payload.success, false);

  let allowed = false;
  checkMaliciousPatterns(
    { body: { message: 'Please update me about the project' }, ip: '127.0.0.1' },
    res,
    () => {
      allowed = true;
    },
  );
  assert.equal(allowed, true);

  for (const message of [
    'Can you select materials from local suppliers?',
    'We want to insert into the wall a new window and update the kitchen set.',
  ]) {
    allowed = false;
    checkMaliciousPatterns({ body: { message }, ip: '127.0.0.1' }, res, () => {
      allowed = true;
    });
    assert.equal(allowed, true, `normal text was rejected: ${message}`);
  }

  statusCode = undefined;
  checkMaliciousPatterns(
    { body: { name: "x' OR '1'='1" }, ip: '127.0.0.1' },
    res,
    () => assert.fail('injection input must not call next'),
  );
  assert.equal(statusCode, 400);
});
