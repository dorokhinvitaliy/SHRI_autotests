import '@testing-library/jest-dom';
import { AnalysisStatus } from '@app-types/analysis';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Dropzone } from './Dropzone';

const status: AnalysisStatus = 'idle';
const defaultProps = {
    file: null,
    status,
    error: null,
    onFileSelect: vi.fn(),
    onClear: vi.fn(),
};

describe('Dropzone Component', () => {
    it('отображает кнопку загрузки', () => {
        render(<Dropzone {...defaultProps} />);
        const button = screen.getByTestId('upload-file-btn');
        expect(button).toBeInTheDocument();
    });

    it('вызывает onFileSelect при выборе csv файла', async () => {
        const onFileSelect = vi.fn();
        render(<Dropzone {...defaultProps} onFileSelect={onFileSelect} />);
        const input = screen.getByTestId('dropzone-file-input');

        const file = new File(['id,name\n1,test'], 'test.csv', { type: 'text/csv' });
        await userEvent.upload(input, file);

        expect(onFileSelect).toHaveBeenCalledWith(file);
    });

    it('не вызывает onFileSelect при загрузке не-csv файла', async () => {
        const onFileSelect = vi.fn();
        render(<Dropzone {...defaultProps} onFileSelect={onFileSelect} />);
        const input = screen.getByTestId('dropzone-file-input');

        const file = new File(['not csv'], 'test.txt', { type: 'text/plain' });
        await userEvent.upload(input, file);

        expect(onFileSelect).not.toHaveBeenCalled();
    });

    it('отображает статус загрузки при status="processing"', () => {
        render(<Dropzone {...defaultProps} status="processing" />);
        expect(screen.getByText('идёт парсинг файла')).toBeInTheDocument();
    });

    it('отображает статус "готово!" при status="completed"', () => {
        const file = new File([''], 'test.csv', { type: 'text/csv' });
        render(<Dropzone {...defaultProps} status="completed" file={file} />);
        expect(screen.getByText('готово!')).toBeInTheDocument();
    });

    it('отображает переданную ошибку', () => {
        render(<Dropzone {...defaultProps} error="ошибка" />);
        expect(screen.getByText('ошибка')).toBeInTheDocument();
    });
});
