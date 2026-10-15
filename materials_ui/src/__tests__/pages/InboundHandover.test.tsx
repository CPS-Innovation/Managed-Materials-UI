import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigationType,
  useParams,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HANDOVER_ERRORS } from '../../handover/journeyContext';
import { getJourneyContext } from '../../handover/journeyContextStorage';
import { InboundHandoverPage } from '../../pages/InboundHandover';

// real layout pulls in pdfjs which cabn't load in jsdom, so mocking it
vi.mock('../../components/Layout/Layout', () => ({
  PlainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const toSearch = (ctx: unknown) => `?ctx=${encodeURIComponent(JSON.stringify(ctx))}`;

const CaseRouteStub = () => {
  const { caseId } = useParams();

  return (
    <>
      <p>{`Loading case ${caseId}`}</p>
      <Outlet />
    </>
  );
};

const LocationProbe = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  return <p data-testid="location">{`${navigationType} ${pathname}`}</p>;
};

const renderHandover = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/go${search}`]}>
      <Routes>
        <Route path="/go" element={<InboundHandoverPage />} />
        <Route path=":caseId/" element={<CaseRouteStub />}>
          <Route path="materials" element={<p>Materials page</p>} />
        </Route>
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );

describe('InboundHandoverPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('sends a default journey to the Materials tab, replacing /go in the history', async () => {
    renderHandover(toSearch({ journey: 'default', caseId: 2155760 }));

    expect(await screen.findByText('Materials page')).toBeInTheDocument();
    expect(screen.getByText('Loading case 2155760')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('REPLACE /2155760/materials');
  });

  it('keeps the journey context for the pages that follow', async () => {
    renderHandover(toSearch({ journey: 'default', caseId: 2155760, documentId: 34 }));

    await screen.findByText('Materials page');
    expect(getJourneyContext(2155760)).toEqual({
      journey: 'default',
      caseId: 2155760,
      documentId: 34,
    });
  });

  it.each([
    ['ctx is missing', '', HANDOVER_ERRORS.NO_CTX],
    ['ctx is not JSON', '?ctx=xyz', HANDOVER_ERRORS.INVALID_JSON],
    [
      'the caseId is missing',
      toSearch({ journey: 'default' }),
      HANDOVER_ERRORS.invalidField('caseId'),
    ],
    [
      'the journey is not supported',
      toSearch({ journey: 'unknown', caseId: 1 }),
      HANDOVER_ERRORS.invalidField('journey'),
    ],
  ])('shows the bad request page when %s', (_, search, reason) => {
    renderHandover(search);

    expect(
      screen.getByRole('heading', { name: 'Sorry, there is a problem with the link' }),
    ).toBeInTheDocument();
    expect(screen.getByText(`HANDOVER_ERROR: ${reason}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'search for a case' })).toHaveAttribute(
      'href',
      '/case-search',
    );
    expect(screen.queryByText('Loading case go')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('POP /go');
    expect(sessionStorage.length).toBe(0);
  });
});
