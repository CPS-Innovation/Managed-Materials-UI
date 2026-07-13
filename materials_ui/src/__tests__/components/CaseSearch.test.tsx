import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CaseSearchPage } from '../../pages/CaseSearch';

describe('<CaseSearchPage />', () => {
  it('should render the Case Search page', () => {
    render(
      <MemoryRouter>
        <CaseSearchPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Find a case')).toBeInTheDocument();
  });

  it('should render the URN input field', () => {
    render(
      <MemoryRouter>
        <CaseSearchPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Search for a case URN')).toBeInTheDocument();
  });

  it('should render the search button', () => {
    render(
      <MemoryRouter>
        <CaseSearchPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('should render the hint text', () => {
    render(
      <MemoryRouter>
        <CaseSearchPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByText('Search and review a CPS case in England and Wales'),
    ).toBeInTheDocument();
  });

  it('should render the cancel link', () => {
    render(
      <MemoryRouter>
        <CaseSearchPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should show error message when URN is invalid', async () => {
    render(
      <MemoryRouter>
        <CaseSearchPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText('Search for a case URN');
    const button = screen.getByRole('button', { name: 'Search' });

    await userEvent.type(input, '06SC12345711');
    await userEvent.click(button);

    expect((await screen.findAllByText('Enter a URN in the right format')).length).toBeGreaterThan(
      0,
    );
  });
});
