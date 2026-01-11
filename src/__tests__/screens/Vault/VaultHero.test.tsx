/**
 * VaultHero component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { VaultHero } from '@/screens/Vault/components/VaultHero';

describe('VaultHero', () => {
  it('renders title', () => {
    const { getByText } = render(
      <VaultHero journeyCount={5} memoryCount={42} />
    );

    expect(getByText('Memory Vault')).toBeTruthy();
  });

  it('renders subtitle', () => {
    const { getByText } = render(
      <VaultHero journeyCount={5} memoryCount={42} />
    );

    expect(getByText('Your collection of completed journeys')).toBeTruthy();
  });

  it('renders journey count', () => {
    const { getByText } = render(
      <VaultHero journeyCount={5} memoryCount={42} />
    );

    expect(getByText('5')).toBeTruthy();
    expect(getByText('Journeys')).toBeTruthy();
  });

  it('renders memory count', () => {
    const { getByText } = render(
      <VaultHero journeyCount={5} memoryCount={42} />
    );

    expect(getByText('42')).toBeTruthy();
    expect(getByText('Memories')).toBeTruthy();
  });

  it('renders with zero counts', () => {
    const { getAllByText } = render(
      <VaultHero journeyCount={0} memoryCount={0} />
    );

    // Both journey and memory count will be 0
    expect(getAllByText('0')).toHaveLength(2);
  });

  it('renders with large counts', () => {
    const { getByText } = render(
      <VaultHero journeyCount={100} memoryCount={5000} />
    );

    expect(getByText('100')).toBeTruthy();
    expect(getByText('5000')).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(
      <VaultHero journeyCount={3} memoryCount={15} />
    );

    expect(toJSON()).toBeTruthy();
  });
});
