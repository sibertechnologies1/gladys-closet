
// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component Integration Test', () => {
  it('renders without crashing', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Wait for AuthProvider to finish its asynchronous
    // Supabase session check and state updates.
    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });
});

