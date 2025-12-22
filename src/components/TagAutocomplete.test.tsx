/**
 * Unit tests for TagAutocomplete component
 *
 * Test coverage:
 * - Component rendering
 * - Debounced search functionality
 * - Keyboard navigation (↑↓, Enter, Escape)
 * - Click outside behavior
 * - Loading states
 * - Empty states
 * - Accessibility (ARIA attributes, keyboard navigation)
 *
 * To run tests:
 * npm test TagAutocomplete.test.tsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagAutocomplete from './TagAutocomplete';
import { TagType } from '../types/tag';
import * as tagService from '../services/tagService';

// Mock the tag service
vi.mock('../services/tagService');

const mockSuggestions = [
  { name: 'LOL', usageCount: 1500 },
  { name: 'League of Legends', usageCount: 1200 },
  { name: 'Lost Ark', usageCount: 800 },
];

describe('TagAutocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render input with placeholder', () => {
      render(
        <TagAutocomplete
          value=""
          onChange={() => {}}
          placeholder="Search tags"
        />
      );

      expect(screen.getByPlaceholderText('Search tags')).toBeInTheDocument();
    });

    it('should display current value in input', () => {
      render(
        <TagAutocomplete
          value="test"
          onChange={() => {}}
        />
      );

      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should debounce API calls by 300ms', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      const onChange = vi.fn();
      render(
        <TagAutocomplete
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');

      // Type quickly
      await userEvent.type(input, 'lol');

      // API should not be called immediately
      expect(mockFetch).not.toHaveBeenCalled();

      // Wait for debounce
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should show suggestions when results are available', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      render(
        <TagAutocomplete
          value="lol"
          onChange={() => {}}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('LOL')).toBeInTheDocument();
        expect(screen.getByText('1.5k users')).toBeInTheDocument();
      });
    });

    it('should show empty state when no results found', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue([]);

      render(
        <TagAutocomplete
          value="nonexistent"
          onChange={() => {}}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/No tags found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      render(
        <TagAutocomplete
          value="lol"
          onChange={() => {}}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('LOL')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');

      // Press down arrow
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // First item should be highlighted (indigo background)
      const firstItem = screen.getByText('LOL').closest('button');
      expect(firstItem).toHaveClass('bg-indigo-600');
    });

    it('should select tag on Enter key', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      const onSelect = vi.fn();
      const onChange = vi.fn();

      render(
        <TagAutocomplete
          value="lol"
          onChange={onChange}
          onSelect={onSelect}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('LOL')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');

      // Navigate to first item and select
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('should close dropdown on Escape key', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      render(
        <TagAutocomplete
          value="lol"
          onChange={() => {}}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('LOL')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('LOL')).not.toBeInTheDocument();
      });
    });
  });

  describe('Click Interactions', () => {
    it('should select tag on click', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      const onSelect = vi.fn();

      render(
        <TagAutocomplete
          value="lol"
          onChange={() => {}}
          onSelect={onSelect}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('LOL')).toBeInTheDocument();
      });

      const tagButton = screen.getByText('LOL');
      fireEvent.click(tagButton);

      expect(onSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('should close dropdown when clicking outside', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      render(
        <div>
          <TagAutocomplete
            value="lol"
            onChange={() => {}}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('LOL')).toBeInTheDocument();
      });

      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(screen.queryByText('LOL')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tag Type Filtering', () => {
    it('should pass tagType to API when specified', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      render(
        <TagAutocomplete
          value="lol"
          onChange={() => {}}
          tagType={TagType.CATEGORY}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            prefix: 'lol',
            tagType: TagType.CATEGORY,
          })
        );
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during API call', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <TagAutocomplete
          value="lol"
          onChange={() => {}}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper autocomplete attribute', () => {
      render(
        <TagAutocomplete
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('should be keyboard navigable', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue(mockSuggestions);

      render(
        <TagAutocomplete
          value="lol"
          onChange={() => {}}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('LOL')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Usage Count Formatting', () => {
    it('should format large numbers with k suffix', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue([
        { name: 'Popular', usageCount: 5000 },
      ]);

      render(
        <TagAutocomplete
          value="pop"
          onChange={() => {}}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('5.0k users')).toBeInTheDocument();
      });
    });

    it('should display small numbers without formatting', async () => {
      const mockFetch = vi.mocked(tagService.fetchTagAutocomplete);
      mockFetch.mockResolvedValue([
        { name: 'Rare', usageCount: 42 },
      ]);

      render(
        <TagAutocomplete
          value="rare"
          onChange={() => {}}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('42 users')).toBeInTheDocument();
      });
    });
  });
});