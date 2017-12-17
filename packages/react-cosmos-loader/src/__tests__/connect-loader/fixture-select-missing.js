// @flow

import { createContext } from '../../create-context';
import { connectLoader } from '../../connect-loader';
import {
  renderer,
  proxies,
  fixtures,
  subscribeToWindowMessages,
  untilEvent,
  postWindowMessage
} from './_shared';

const mockMount = jest.fn();

jest.mock('../../create-context', () => ({
  createContext: jest.fn(() => ({ mount: mockMount }))
}));

subscribeToWindowMessages();

let destroy;

beforeEach(async () => {
  jest.clearAllMocks();

  destroy = await connectLoader({
    renderer,
    proxies,
    fixtures
  });

  await untilEvent('loaderReady');

  postWindowMessage({
    type: 'fixtureSelect',
    component: 'Foo',
    fixture: 'qux'
  });

  await untilEvent('fixtureSelect');
});

// Ensure state doesn't leak between tests
afterEach(() => destroy());

it('does not create', () => {
  expect(createContext).not.toHaveBeenCalled();
});
