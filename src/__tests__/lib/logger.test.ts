/**
 * Logger tests
 */

/* eslint-disable no-console */
import { logger } from '@/lib/logger';

describe('logger', () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('in development mode', () => {
    beforeAll(() => {
      // @ts-expect-error - __DEV__ is a global
      global.__DEV__ = true;
    });

    it('logs debug messages', () => {
      logger.debug('Debug message');

      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toContain('[DEBUG]');
      expect((console.log as jest.Mock).mock.calls[0][0]).toContain('Debug message');
    });

    it('logs info messages', () => {
      logger.info('Info message');

      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toContain('[INFO]');
    });

    it('logs warn messages', () => {
      logger.warn('Warning message');

      expect(console.warn).toHaveBeenCalled();
      expect((console.warn as jest.Mock).mock.calls[0][0]).toContain('[WARN]');
    });

    it('logs error messages', () => {
      logger.error('Error message');

      expect(console.error).toHaveBeenCalled();
      expect((console.error as jest.Mock).mock.calls[0][0]).toContain('[ERROR]');
    });

    it('includes context in log messages', () => {
      logger.info('Message with context', { userId: '123', action: 'login' });

      expect(console.log).toHaveBeenCalled();
      const logMessage = (console.log as jest.Mock).mock.calls[0][0];
      expect(logMessage).toContain('userId');
      expect(logMessage).toContain('123');
    });
  });

  describe('error logging', () => {
    it('always logs errors regardless of dev mode', () => {
      logger.error('Critical error', { code: 500 });

      expect(console.error).toHaveBeenCalled();
    });
  });
});

