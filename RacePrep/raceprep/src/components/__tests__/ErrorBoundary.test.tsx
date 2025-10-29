import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// Mock React Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <View testID="error-boundary">
    <Text testID="error-title">Something went wrong</Text>
    <Text testID="error-message">{error?.message || 'An unexpected error occurred'}</Text>
    <Text testID="error-retry">Please try refreshing the page</Text>
  </View>
);

// Custom error fallback for testing
const CustomErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <View testID="custom-error-boundary">
    <Text testID="custom-error-title">Oops! Training data error</Text>
    <Text testID="custom-error-details">{error?.message}</Text>
  </View>
);

// Component that throws an error for testing
const ThrowingComponent: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({
  shouldThrow = false,
  errorMessage = 'Test error'
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <Text testID="working-component">Component is working</Text>;
};

// Component that simulates async errors
const AsyncErrorComponent: React.FC<{ shouldError?: boolean }> = ({ shouldError = false }) => {
  React.useEffect(() => {
    if (shouldError) {
      throw new Error('Async operation failed');
    }
  }, [shouldError]);

  return <Text testID="async-component">Async component loaded</Text>;
};

// Training-specific error component
const TrainingDataComponent: React.FC<{ workoutData?: any[] }> = ({ workoutData = [] }) => {
  if (!Array.isArray(workoutData)) {
    throw new Error('Invalid workout data format');
  }

  if (workoutData.some(workout => !workout.id)) {
    throw new Error('Workout missing required ID field');
  }

  return (
    <View testID="training-data">
      {workoutData.map(workout => (
        <Text key={workout.id} testID={`workout-${workout.id}`}>
          {workout.name || 'Unnamed workout'}
        </Text>
      ))}
    </View>
  );
};

describe('Error Boundary', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Error Handling', () => {
    it('renders children when there are no errors', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('working-component')).toBeTruthy();
      expect(screen.getByText('Component is working')).toBeTruthy();
    });

    it('catches and displays error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Component crashed" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeTruthy();
      expect(screen.getByTestId('error-title')).toBeTruthy();
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText('Component crashed')).toBeTruthy();
    });

    it('shows default message when error has no message', () => {
      const ComponentWithEmptyError = () => {
        throw new Error('');
      };

      render(
        <ErrorBoundary>
          <ComponentWithEmptyError />
        </ErrorBoundary>
      );

      expect(screen.getByText('An unexpected error occurred')).toBeTruthy();
    });

    it('uses custom fallback component when provided', () => {
      render(
        <ErrorBoundary fallback={CustomErrorFallback}>
          <ThrowingComponent shouldThrow={true} errorMessage="Training data error" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-error-boundary')).toBeTruthy();
      expect(screen.getByText('Oops! Training data error')).toBeTruthy();
      expect(screen.getByText('Training data error')).toBeTruthy();
    });
  });

  describe('Training-Specific Error Scenarios', () => {
    it('handles invalid workout data format errors', () => {
      render(
        <ErrorBoundary fallback={CustomErrorFallback}>
          <TrainingDataComponent workoutData={'invalid' as any} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-error-boundary')).toBeTruthy();
      expect(screen.getByText('Invalid workout data format')).toBeTruthy();
    });

    it('handles missing required fields in workout data', () => {
      const invalidWorkouts = [
        { id: '1', name: 'Valid workout' },
        { name: 'Invalid workout without id' }, // Missing ID
      ];

      render(
        <ErrorBoundary fallback={CustomErrorFallback}>
          <TrainingDataComponent workoutData={invalidWorkouts} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-error-boundary')).toBeTruthy();
      expect(screen.getByText('Workout missing required ID field')).toBeTruthy();
    });

    it('renders successfully with valid workout data', () => {
      const validWorkouts = [
        { id: '1', name: 'Morning Run' },
        { id: '2', name: 'Evening Swim' },
      ];

      render(
        <ErrorBoundary>
          <TrainingDataComponent workoutData={validWorkouts} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('training-data')).toBeTruthy();
      expect(screen.getByTestId('workout-1')).toBeTruthy();
      expect(screen.getByTestId('workout-2')).toBeTruthy();
      expect(screen.getByText('Morning Run')).toBeTruthy();
      expect(screen.getByText('Evening Swim')).toBeTruthy();
    });

    it('handles workout with missing name gracefully', () => {
      const workoutsWithMissingName = [
        { id: '1', name: 'Named workout' },
        { id: '2' }, // Missing name
      ];

      render(
        <ErrorBoundary>
          <TrainingDataComponent workoutData={workoutsWithMissingName} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('training-data')).toBeTruthy();
      expect(screen.getByText('Named workout')).toBeTruthy();
      expect(screen.getByText('Unnamed workout')).toBeTruthy();
    });
  });

  describe('Async Error Handling', () => {
    it('catches errors thrown in useEffect', () => {
      render(
        <ErrorBoundary>
          <AsyncErrorComponent shouldError={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeTruthy();
      expect(screen.getByText('Async operation failed')).toBeTruthy();
    });

    it('renders normally when no async errors occur', () => {
      render(
        <ErrorBoundary>
          <AsyncErrorComponent shouldError={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('async-component')).toBeTruthy();
      expect(screen.getByText('Async component loaded')).toBeTruthy();
    });
  });

  describe('Multiple Error Scenarios', () => {
    it('handles multiple child components with only one throwing', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
          <ThrowingComponent shouldThrow={true} errorMessage="Second component error" />
        </ErrorBoundary>
      );

      // Should show error boundary since one component threw
      expect(screen.getByTestId('error-boundary')).toBeTruthy();
      expect(screen.getByText('Second component error')).toBeTruthy();
    });

    it('handles different types of errors appropriately', () => {
      const NetworkErrorComponent = () => {
        throw new Error('Network connection failed');
      };

      render(
        <ErrorBoundary>
          <NetworkErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeTruthy();
      expect(screen.getByText('Network connection failed')).toBeTruthy();
    });
  });

  describe('Error Recovery', () => {
    it('can recover when error is fixed', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Initially shows error
      expect(screen.getByTestId('error-boundary')).toBeTruthy();

      // Re-render with fixed component
      rerender(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      // Error boundary state persists until component is remounted
      // This behavior is expected - error boundaries don't auto-recover
      expect(screen.getByTestId('error-boundary')).toBeTruthy();
    });
  });

  describe('Integration with Training App', () => {
    it('provides meaningful error messages for Strava integration failures', () => {
      const StravaErrorComponent = () => {
        throw new Error('Failed to sync with Strava: Rate limit exceeded');
      };

      render(
        <ErrorBoundary fallback={CustomErrorFallback}>
          <StravaErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-error-boundary')).toBeTruthy();
      expect(screen.getByText('Failed to sync with Strava: Rate limit exceeded')).toBeTruthy();
    });

    it('handles database connection errors gracefully', () => {
      const DatabaseErrorComponent = () => {
        throw new Error('Database connection timeout');
      };

      render(
        <ErrorBoundary>
          <DatabaseErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeTruthy();
      expect(screen.getByText('Database connection timeout')).toBeTruthy();
      expect(screen.getByText('Please try refreshing the page')).toBeTruthy();
    });
  });
});