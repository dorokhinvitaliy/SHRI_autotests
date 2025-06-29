import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import * as storage from '@utils/storage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ClearHistoryButton } from './ClearHistoryButton';

const clearHistoryMock = vi.fn();
const historyMock = [{ id: '1', fileName: 'test.csv', timestamp: Date.now(), highlights: [{}] }];

vi.mock('@store/historyStore', () => ({
    useHistoryStore: () => ({
        clearHistory: clearHistoryMock,
        history: historyMock,
    }),
}));

vi.mock('@utils/storage', () => ({
    clearHistory: vi.fn(),
}));

describe('ClearHistoryButton Component', () => {
    beforeEach(() => {
        clearHistoryMock.mockClear();
        vi.mocked(storage.clearHistory).mockClear();
        cleanup();
    });

    it('вызывает очистку истории и localStorage при клике на кнопку', async () => {
        render(<ClearHistoryButton />);
        const button = screen.getByTestId('delete-button');

        await userEvent.click(button);

        expect(clearHistoryMock).toHaveBeenCalledTimes(1);
        expect(storage.clearHistory).toHaveBeenCalledTimes(1);
    });

    it('отображает кнопку, если есть история', () => {
        render(<ClearHistoryButton />);
        const button = screen.getByTestId('delete-button');
        expect(button).toBeInTheDocument();
    });

    it('не отображает кнопку, если история пуста', () => {
        historyMock.length = 0;
        render(<ClearHistoryButton />);
        const button = screen.queryByTestId('delete button');
        expect(button).not.toBeInTheDocument();
    });
});
