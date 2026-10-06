import { describe, it, expect } from 'vitest';
import { useFabStore } from './fabStore.js';

describe('useFabStore', () => {
  it('stores and clears contextual FAB actions', () => {
    expect(useFabStore.getState().currentAction).toBeNull();

    const dummyAction = {
      label: 'Sesi',
      icon: 'add',
      onClick: () => {},
    };

    useFabStore.getState().setAction(dummyAction);
    expect(useFabStore.getState().currentAction).toEqual(dummyAction);

    useFabStore.getState().setAction(null);
    expect(useFabStore.getState().currentAction).toBeNull();
  });
});
