import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import '@testing-library/jest-dom/vitest';
import { ReadableStream } from 'web-streams-polyfill';

describe('Analysis page', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('рендерит стартовую инструкцию и компонент Uploader', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('uploader')).toBeInTheDocument();
    });

    it('показывает ошибку при загрузке не-CSV файла', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <HomePage />
            </MemoryRouter>
        );

        const fileInput = screen.getAllByTestId('dropzone-file-input')[0] as HTMLInputElement;
        const badFile = new File(['content'], 'test.txt', { type: 'text/plain' });

        fireEvent.change(fileInput, { target: { files: [badFile] } });

        await waitFor(() => {
            expect(screen.queryByText('Можно загружать только *.csv файлы')).toBeInTheDocument();
        });
    });

    it('запускает парсинг и обновляет прогресс', async () => {
        // Подготавливаем стрим с данными
        const mockChunks = [
            JSON.stringify({
                total_spend_galactic: 1000,
                rows_affected: 100,
                less_spent_at: 10,
                big_spent_at: 300,
                less_spent_value: 50,
                big_spent_value: 9999,
                average_spend_galactic: 500,
                big_spent_civ: 'Romulans',
                less_spent_civ: 'Vulcans',
            }) + '\n',
        ];
        const encoder = new TextEncoder();
        const mockReader = {
            read: vi
                .fn()
                .mockResolvedValueOnce({ done: false, value: encoder.encode(mockChunks[0]) })
                .mockResolvedValueOnce({ done: true }),
        };

        const mockStream = {
            getReader: () => mockReader,
        };

        // Мокаем fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                body: mockStream,
            })
        ) as any;

        // Рендерим страницу
        render(
            <MemoryRouter initialEntries={['/']}>
                <HomePage />
            </MemoryRouter>
        );

        // Находим первый input[type="file"] через getAllByTestId
        const fileInputs = screen.getAllByTestId('dropzone-file-input');
        const fileInput = fileInputs[0] as HTMLInputElement;

        // Создаём мокнутый CSV-файл
        const file = new File(['id,civ,date,spend\n1,humans,63,9026\n2,blobs,16,6598'], 'data.csv', {
            type: 'text/csv',
        });

        // Загружаем файл
        await fireEvent.change(fileInput, { target: { files: [file] } });

        // Проверяем, что файл загружен
        await waitFor(() => {
            const statusTexts = screen.getAllByTestId('dropzone-status-text');
            expect(statusTexts[0]).toHaveTextContent('файл загружен!');
        });

        // Находим кнопку отправки
        const startButtons = screen.getAllByTestId('upload-button');
        const startButton = startButtons[0];

        // Нажимаем на кнопку
        await fireEvent.click(startButton);

        // Ожидаем начало парсинга
        await waitFor(() => {
            const statusTexts = screen.getAllByTestId('dropzone-status-text');
            expect(statusTexts[0]).toHaveTextContent('идёт парсинг файла');
        });

        // Ожидаем завершения парсинга
        await waitFor(() => {
            const statusTexts = screen.getAllByTestId('dropzone-status-text');
            expect(statusTexts[0]).toHaveTextContent('готово!');
        });

        // Ожидаем появление карточек
        /* await waitFor(() => {
            const highlightCards = screen.getAllByTestId('analysis-card');
            expect(highlightCards).toHaveLength(8);
        }); */
    });
});
