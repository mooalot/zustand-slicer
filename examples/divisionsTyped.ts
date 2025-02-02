import { create } from 'zustand';
import { Divide } from '../src/types';
import { createDivision, divisionHooks, divide } from '../src/utils';

type Division1 = {
  dataInDivision1: string;
};

type Division2 = {
  dataInDivision2: string;
};

const createDivision1 = createDivision<Division1>()(() => ({
  prefix: 'division1',
  creator: () => ({
    dataInDivision1: 'data',
  }),
  options: {
    partialized: (state) => ({
      dataInDivision1: state.dataInDivision1,
    }),
  },
}));

const createDivision2 = createDivision<Division2>()(() => ({
  prefix: 'division2',
  creator: () => ({
    dataInDivision2: 'data',
  }),
  options: {},
}));

const divisions = [createDivision1(), createDivision2()] as const;

type AppState = Divide<typeof divisions>;

const useStore = create<AppState>()(divide(divisions));

export const [useDivision1, useDivision2] = divisionHooks(
  useStore,
  ...divisions
);

// useStore((state) => state.division1_dataInDivision1);
// useStore((state) => state.division2_dataInDivision2);
// useStore.getState;
// useStore.setState;

// useDivision1((state) => state.dataInDivision1);
// useDivision1.getState;
// useDivision1.setState;
// useDivision2((state) => state.dataInDivision2);
// useDivision2.getState;
// useDivision2.setState;
