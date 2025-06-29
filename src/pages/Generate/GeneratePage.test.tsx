import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GeneratePage } from './GeneratePage';

describe('GeneratePage Component', () => {
    const mockFetch = vi.fn();
    const mockCreateObjectURL = vi.fn();
    const mockRevokeObjectURL = vi.fn();

    beforeEach(() => {
        global.fetch = mockFetch;
        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        mockFetch.mockReset();
        mockCreateObjectURL.mockReturnValue('mock-url');
    });

    it('отображаетcя заголовок и кнопка генерации', () => {
        render(<GeneratePage />);

        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByTestId('generate-button')).toHaveTextContent('Начать генерацию');
    });

    describe('случай успешной генерация', () => {
        beforeEach(() => {
            mockFetch.mockResolvedValue({
                ok: true,
                headers: new Map([['content-disposition', 'filename="report.csv"']]),
                blob: () => Promise.resolve(new Blob()),
            });
        });

        it('при клике на кнопку скачивается файл и появляется сообщение об успехе', async () => {
            render(<GeneratePage />);
            await userEvent.click(screen.getByTestId('generate-button'));

            await waitFor(() => {
                expect(mockCreateObjectURL).toHaveBeenCalled();
                expect(screen.getByText('Отчёт успешно сгенерирован!')).toBeInTheDocument();
            });
        });
    });

    describe('случай ошибки генерации', () => {
        it('показывает сообщение об ошибке с сервера', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ error: 'Ошибка на сервере' }),
            });

            render(<GeneratePage />);
            const btn = screen.getByTestId('generate-button');
            await userEvent.click(btn);

            expect(await screen.findByTestId('generate-error')).toBeInTheDocument();
        });
    });
});
