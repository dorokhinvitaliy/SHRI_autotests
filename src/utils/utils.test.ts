import { describe, it, expect, beforeEach } from 'vitest';

import { isCsvFile } from './analysis';
import { STORAGE_KEY } from './consts';
import { formatDate } from './formateDate';
import { addToHistory, clearHistory } from './storage';

const mockItem = {
  status: 'success',
  fileName: 'test.csv',
  data: [],
};

describe('Корректность работы утилит', () => {
  describe('formateDate', () => {
    it('форматирует дату с объектом Date', () => {
      expect(formatDate(new Date('2024-01-01'))).toBe('01.01.2024');
    });

    it('форматирует дату с таймстампом в миллисекундах', () => {
      const timestamp = new Date('2023-12-25').getTime();
      expect(formatDate(timestamp)).toBe('25.12.2023');
    });
  });

  describe('storage utils', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('добавляет элемент в историю', () => {
      addToHistory(mockItem);
      const history = localStorage.getItem(STORAGE_KEY);
      expect(history).not.toBeNull();
      expect(history!).toContain('test.csv');
    });

    it('очищает историю', () => {
      addToHistory(mockItem);
      clearHistory();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('isCsvFile', () => {
    it('возвращает true для .csv файла', () => {
      const file = new File([], 'test.csv');
      expect(isCsvFile(file)).toBe(true);
    });

    it('возвращает false для других расширений', () => {
      const file = new File([], 'test.txt');
      expect(isCsvFile(file)).toBe(false);
    });
  });
});
