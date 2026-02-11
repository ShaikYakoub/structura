import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  const mockProps = {
    title: 'Welcome to Structura',
    subtitle: 'Build websites in minutes',
    actions: [
      {
        label: 'Get Started',
        href: '/register',
        variant: 'default' as const,
      },
      {
        label: 'Learn More',
        href: '/about',
        variant: 'outline' as const,
      },
    ],
    imageUrl: '/hero-image.jpg',
    imagePosition: 'right' as const,
    backgroundStyle: 'solid' as const,
  };

  it('renders the hero section with title', () => {
    render(<HeroSection {...mockProps} />);
    
    const title = screen.getByText('Welcome to Structura');
    expect(title).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<HeroSection {...mockProps} />);
    
    const subtitle = screen.getByText('Build websites in minutes');
    expect(subtitle).toBeInTheDocument();
  });

  it('renders primary button with correct text and link', () => {
    render(<HeroSection {...mockProps} />);
    
    const primaryButton = screen.getByRole('link', { name: /get started/i });
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', '/register');
  });

  it('renders secondary button with correct text and link', () => {
    render(<HeroSection {...mockProps} />);
    
    const secondaryButton = screen.getByRole('link', { name: /learn more/i });
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', '/about');
  });

  it('handles missing actions gracefully', () => {
    const propsWithoutActions = {
      title: 'Welcome to Structura',
      subtitle: 'Build websites in minutes',
      actions: [],
    };

    render(<HeroSection {...propsWithoutActions} />);
    
    const title = screen.getByText('Welcome to Structura');
    expect(title).toBeInTheDocument();
    
    const buttons = screen.queryAllByRole('link');
    expect(buttons).toHaveLength(0);
  });

  it('uses default values when no props provided', () => {
    render(<HeroSection />);
    
    const defaultTitle = screen.getByText('Build Amazing Products Fast');
    expect(defaultTitle).toBeInTheDocument();
  });

  it('supports old data format for backward compatibility', () => {
    const oldFormatProps = {
      data: {
        title: 'Old Format Title',
        subtitle: 'Old format subtitle',
        image: '/old-image.jpg',
      },
    };

    render(<HeroSection {...oldFormatProps} />);
    
    const title = screen.getByText('Old Format Title');
    expect(title).toBeInTheDocument();
  });

  it('applies gradient background when specified', () => {
    const { container } = render(
      <HeroSection {...mockProps} backgroundStyle="gradient" />
    );
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-gradient-to-br');
  });

  it('applies solid background by default', () => {
    const { container } = render(<HeroSection {...mockProps} />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-background');
  });

  it('renders multiple actions correctly', () => {
    const propsWithManyActions = {
      title: 'Test',
      actions: [
        { label: 'Action 1', href: '/1' },
        { label: 'Action 2', href: '/2' },
        { label: 'Action 3', href: '/3' },
      ],
    };

    render(<HeroSection {...propsWithManyActions} />);
    
    expect(screen.getByRole('link', { name: 'Action 1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Action 2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Action 3' })).toBeInTheDocument();
  });
});
