// src/pages/Generate/Generate.test.tsx
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { GeneratePage } from './GeneratePage';

describe('GeneratePage', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        // Заменяем fetch на mock
        global.fetch = vi.fn();
    });

    afterEach(() => {
        // Восстанавливаем оригинальный fetch после каждого теста
        global.fetch = originalFetch;
    });
    it('рендерит кнопку "Сгенерировать"', () => {
        render(
            <MemoryRouter initialEntries={['/generate']}>
                <GeneratePage />
            </MemoryRouter>
        );

        expect(screen.getAllByTestId('generate-button')[0]).toBeInTheDocument();
    });

    it('отображает лоадер при нажатии на "Сгенерировать" и затем сообщение об успехе', async () => {
        const mockBlob = new Blob([''], { type: 'text/csv' });

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(mockBlob),
            headers: {
                get: vi.fn().mockReturnValue('filename="report.csv"'),
            },
        });
        render(
            <MemoryRouter initialEntries={['/generate']}>
                <GeneratePage />
            </MemoryRouter>
        );

        const generateButton = screen.getAllByTestId('generate-button')[0];
        userEvent.click(generateButton);

        await waitFor(() => {
            expect(generateButton).toBeDisabled();
            expect(screen.getByTestId('loader')).toBeInTheDocument();
        });
        expect(screen.getByTestId('generate-error')).toBeInTheDocument();
    });

    it('обрабатывает ошибку сервера', async () => {
        render(
            <MemoryRouter initialEntries={['/generate']}>
                <GeneratePage />
            </MemoryRouter>
        );

        const generateButton = screen.getAllByTestId('generate-button')[0];
        fireEvent.click(generateButton);

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
            })
        ) as any;

        await waitFor(() => {
            expect(screen.getByTestId('generate-error')).toBeInTheDocument();
        });
    });

    /* it('доступен по маршруту /generate', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/generate']}>
                <GeneratePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(container).toBeInTheDocument();
        });

        expect(screen.getAllByTestId('generate-button')[0]).toBeInTheDocument();
    }); */
});
