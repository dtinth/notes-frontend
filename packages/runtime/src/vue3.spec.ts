import { describe, it, expect } from 'vitest';
import { executeCjs } from './vue3';

describe('vue3 runtime', () => {
  it('should execute CJS code', () => {
    const cjs = `
      exports.default = { 
        name: 'TestComponent',
        template: '<div>Hello</div>' 
      };
    `;
    
    const result = executeCjs(cjs, {});
    expect(result.default.name).toBe('TestComponent');
  });
});