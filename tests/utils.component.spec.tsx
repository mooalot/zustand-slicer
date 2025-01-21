import { afterEach, expect, test } from 'vitest';
import React from 'react';
import { create } from 'zustand';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { createDivision, divisionHooks, divide } from '../src/utils';
import { Divide } from '../src/types';

type Division1 = {
  dataInDivision1: string;
  updateDivision1Data: (data: string) => void;
  resetDivision1Data: () => void;
};

type Division2 = {
  dataInDivision2: string;
  updateDivision2Data: (data: string) => void;
  resetDivision2Data: () => void;
};

// Define divisions
const createDivision1 = createDivision<Division1>()(() => ({
  prefix: 'division1',
  creator: (set) => ({
    dataInDivision1: 'Initial Division1 Data',
    updateDivision1Data: (data) => set({ dataInDivision1: data }),
    resetDivision1Data: () =>
      set({ dataInDivision1: 'Initial Division1 Data' }),
  }),
}));

const createDivision2 = createDivision<Division2>()(() => ({
  prefix: 'division2',
  creator: (set) => ({
    dataInDivision2: 'Initial Division2 Data',
    updateDivision2Data: (data) => set({ dataInDivision2: data }),
    resetDivision2Data: () =>
      set({ dataInDivision2: 'Initial Division2 Data' }),
  }),
}));

const divisions = [createDivision1(), createDivision2()] as const;
type AppState = Divide<typeof divisions>;

// Create zustand store
const useStore = create<AppState>(divide(() => ({}), divisions));

// Create utils for divisions
const [useDivision1, useDivision2] = divisionHooks(useStore, ...divisions);

// React components for testing
const Division1Component = () => {
  const data = useDivision1((state) => state.dataInDivision1);
  const { updateDivision1Data } = useDivision1.getState();
  return (
    <div>
      <p data-testid="division1-data">{data}</p>
      <button
        onClick={() => updateDivision1Data('Updated Division1 Data')}
        type="button"
      >
        Update Division1
      </button>
      <button
        onClick={() =>
          useDivision1.setState({
            dataInDivision1: 'Updated Division1 Data Using setState',
          })
        }
        type="button"
      >
        Update Division1 Using setState
      </button>
    </div>
  );
};

const Division2Component = () => {
  const data = useDivision2((state) => state.dataInDivision2);
  const { updateDivision2Data } = useDivision2.getState();
  return (
    <div>
      <p data-testid="division2-data">{data}</p>
      <button
        onClick={() => updateDivision2Data('Updated Division2 Data')}
        type="button"
      >
        Update Division2
      </button>
      <button
        onClick={() =>
          useDivision2.setState({
            dataInDivision2: 'Updated Division2 Data Using setState',
          })
        }
        type="button"
      >
        Update Division2 Using setState
      </button>
    </div>
  );
};

const App = () => {
  const { division1_resetDivision1Data, division2_resetDivision2Data } =
    useStore.getState();
  const resetAll = () => {
    division1_resetDivision1Data();
    division2_resetDivision2Data();
  };
  return (
    <div>
      <Division1Component />
      <Division2Component />
      <button onClick={resetAll} type="button">
        Reset All
      </button>
      <button
        onClick={() =>
          useStore.setState({
            division1_dataInDivision1: 'Initial Division1 Data',
            division2_dataInDivision2: 'Initial Division2 Data',
          })
        }
        type="button"
      >
        Reset All Using setState
      </button>
    </div>
  );
};

// Clean up after each test
afterEach(cleanup);

// Tests
describe('Zustand Divisions with Components', () => {
  const resetStore = () => {
    useStore.setState({
      division1_dataInDivision1: 'Initial Division1 Data',
      division2_dataInDivision2: 'Initial Division2 Data',
    });
  };
  afterEach(resetStore);

  test('should render initial data for divisions', () => {
    render(<App />);
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Initial Division1 Data'
    );
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Initial Division2 Data'
    );
  });

  test('should update division1 data when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Initial Division1 Data'
    );
    await user.click(screen.getByRole('button', { name: 'Update Division1' }));
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Updated Division1 Data'
    );
  });

  test('should update division1 data when the setState button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Initial Division1 Data'
    );
    await user.click(
      screen.getByRole('button', { name: 'Update Division1 Using setState' })
    );
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Updated Division1 Data Using setState'
    );
  });

  test('should update division2 data when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Initial Division2 Data'
    );
    await user.click(screen.getByRole('button', { name: 'Update Division2' }));
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Updated Division2 Data'
    );
  });

  test('should update division2 data when the setState button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Initial Division2 Data'
    );
    await user.click(
      screen.getByRole('button', { name: 'Update Division2 Using setState' })
    );
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Updated Division2 Data Using setState'
    );
  });

  test('should reset all divisions when the reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Update Division1' }));
    await user.click(screen.getByRole('button', { name: 'Update Division2' }));
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Updated Division1 Data'
    );
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Updated Division2 Data'
    );

    await user.click(screen.getByRole('button', { name: 'Reset All' }));
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Initial Division1 Data'
    );
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Initial Division2 Data'
    );
  });

  test('should reset all divisions when the setState button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Update Division1' }));
    await user.click(screen.getByRole('button', { name: 'Update Division2' }));
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Updated Division1 Data'
    );
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Updated Division2 Data'
    );

    await user.click(
      screen.getByRole('button', { name: 'Reset All Using setState' })
    );
    expect(screen.getByTestId('division1-data')).toHaveTextContent(
      'Initial Division1 Data'
    );
    expect(screen.getByTestId('division2-data')).toHaveTextContent(
      'Initial Division2 Data'
    );
  });
});
