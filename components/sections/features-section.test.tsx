import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from './features-section';

describe('FeaturesSection', () => {
  const mockData = {
    title: 'Our Amazing Features',
    features: [
      {
        title: 'Lightning Fast',
        description: 'Optimized for speed and performance',
      },
      {
        title: 'Secure',
        description: 'Enterprise-grade security',
      },
      {
        title: 'Global',
        description: 'Available worldwide',
      },
    ],
  };

  it('renders section title', () => {
    render(<FeaturesSection data={mockData} />);
    
    expect(screen.getByText('Our Amazing Features')).toBeInTheDocument();
  });

  it('renders all features', () => {
    render(<FeaturesSection data={mockData} />);
    
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeaturesSection data={mockData} />);
    
    expect(screen.getByText('Optimized for speed and performance')).toBeInTheDocument();
    expect(screen.getByText('Enterprise-grade security')).toBeInTheDocument();
    expect(screen.getByText('Available worldwide')).toBeInTheDocument();
  });

  it('handles empty features array', () => {
    const emptyData = {
      title: 'Features',
      features: [],
    };
    
    const { container } = render(<FeaturesSection data={emptyData} />);
    
    const featureCards = container.querySelectorAll('[class*="Card"]');
    expect(featureCards.length).toBe(0);
  });

  it('renders correct number of feature cards', () => {
    render(<FeaturesSection data={mockData} />);
    
    const featureTitles = [
      screen.getByText('Lightning Fast'),
      screen.getByText('Secure'),
      screen.getByText('Global'),
    ];
    
    expect(featureTitles).toHaveLength(3);
  });
});
