import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Extend Vitest's `expect` with Jest DOM matchers
expect.extend(matchers);

// Mock import.meta if needed
Object.defineProperty(global, 'import.meta', { value: { env: { MODE: 'test' } } });
