import retry from '@skidding/async-retry';
import React from 'react';
import { createValue } from 'react-cosmos-shared2/fixtureState';
import { uuid } from 'react-cosmos-shared2/util';
import { ReactTestRenderer } from 'react-test-renderer';
import { testFixtureLoader } from '../testHelpers';

// IMPORTANT: useValue has to be imported after the testHelpers mocks
import { useValue } from '..';

type Profile = {
  isAdmin: boolean;
  name: string;
  age: number;
  onClick: () => unknown;
};

function createFixtures({ defaultValue }: { defaultValue: Profile[] }) {
  const MyComponent = () => {
    const [profiles] = useValue('profiles', { defaultValue });
    return <>{JSON.stringify(profiles, null, 2)}</>;
  };
  return {
    first: <MyComponent />
  };
}

const rendererId = uuid();
const fixtures = createFixtures({
  defaultValue: [{ isAdmin: true, name: 'Pat D', age: 45, onClick: () => {} }]
});
const fixtureId = { path: 'first', name: null };

testFixtureLoader(
  'renders fixture',
  { rendererId, fixtures },
  async ({ renderer, selectFixture }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await rendered(renderer, [{ isAdmin: true, name: 'Pat D', age: 45 }]);
  }
);

testFixtureLoader(
  'creates fixture state',
  { rendererId, fixtures },
  async ({ selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: expect.any(Array),
        values: {
          profiles: {
            defaultValue: createValue([
              { isAdmin: true, name: 'Pat D', age: 45, onClick: () => {} }
            ]),
            currentValue: createValue([
              { isAdmin: true, name: 'Pat D', age: 45, onClick: () => {} }
            ])
          }
        }
      }
    });
  }
);

testFixtureLoader(
  'resets fixture state on default value change',
  { rendererId, fixtures },
  async ({ update, selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    update({
      rendererId,
      fixtures: createFixtures({
        defaultValue: [
          { isAdmin: false, name: 'Pat D', age: 45, onClick: () => {} },
          { isAdmin: true, name: 'Dan B', age: 39, onClick: () => {} }
        ]
      })
    });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: expect.any(Array),
        values: {
          profiles: {
            defaultValue: createValue([
              { isAdmin: false, name: 'Pat D', age: 45, onClick: () => {} },
              { isAdmin: true, name: 'Dan B', age: 39, onClick: () => {} }
            ]),
            currentValue: createValue([
              { isAdmin: false, name: 'Pat D', age: 45, onClick: () => {} },
              { isAdmin: true, name: 'Dan B', age: 39, onClick: () => {} }
            ])
          }
        }
      }
    });
  }
);

async function rendered(
  renderer: ReactTestRenderer,
  profiles: Array<Pick<Profile, 'isAdmin' | 'name' | 'age'>>
) {
  await retry(() => {
    const renderedText = getRenderedText(renderer);
    profiles.forEach(profile => {
      expect(renderedText).toMatch(`"isAdmin": ${profile.isAdmin}`);
      expect(renderedText).toMatch(`"name": "${profile.name}"`);
      expect(renderedText).toMatch(`"age": ${profile.age}`);
    });
  });
}

function getRenderedText(renderer: ReactTestRenderer) {
  return renderer.toJSON();
}