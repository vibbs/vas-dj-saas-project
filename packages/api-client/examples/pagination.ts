/**
 * Pagination Example
 *
 * This example demonstrates how to work with paginated API responses.
 */

import {
  OrganizationsService,
  UsersService,
  hasNextPage,
  hasPreviousPage,
  extractPageNumber,
  iterateAll,
  collectAll,
} from '@vas-dj-saas/api-client';

// ========================================
// 1. Basic Pagination
// ========================================

async function basicPagination() {
  // Fetch first page
  const response = await OrganizationsService.list({
    page: 1,
    pageSize: 10,
  });

  if (response.status === 200 && response.data.data) {
    const { results, count, next, previous } = response.data.data;

    console.log(`Showing ${results?.length || 0} of ${count} organizations`);
    console.log('Results:', results);
    console.log('Has next page:', !!next);
    console.log('Has previous page:', !!previous);
  }
}

// ========================================
// 2. Navigate Through Pages
// ========================================

async function navigateThroughPages() {
  let currentPage = 1;
  const pageSize = 10;

  while (true) {
    const response = await OrganizationsService.list({
      page: currentPage,
      pageSize,
    });

    if (response.status === 200 && response.data.data) {
      const { results, next } = response.data.data;

      console.log(`Page ${currentPage}:`, results);

      // Check if there's a next page
      if (!next) {
        console.log('No more pages');
        break;
      }

      currentPage++;
    } else {
      break;
    }
  }
}

// ========================================
// 3. Using Pagination Helpers
// ========================================

async function usingPaginationHelpers() {
  const response = await OrganizationsService.list({ page: 1 });

  if (response.status === 200 && response.data.data) {
    const data = response.data.data;

    // Check for next/previous pages
    console.log('Has next page:', hasNextPage(data));
    console.log('Has previous page:', hasPreviousPage(data));

    // Extract page numbers from URLs
    if (data.next) {
      const nextPageNum = extractPageNumber(data.next);
      console.log('Next page number:', nextPageNum);
    }

    if (data.previous) {
      const prevPageNum = extractPageNumber(data.previous);
      console.log('Previous page number:', prevPageNum);
    }
  }
}

// ========================================
// 4. Fetch All Pages (Async Iterator)
// ========================================

async function fetchAllWithIterator() {
  const fetcher = (page: number) =>
    OrganizationsService.list({ page, pageSize: 20 });

  console.log('Fetching all organizations...');

  for await (const org of iterateAll(fetcher)) {
    console.log('Organization:', org.name);
    // Process each organization as it's fetched
  }

  console.log('Done fetching all organizations');
}

// ========================================
// 5. Collect All Pages at Once
// ========================================

async function collectAllPages() {
  const fetcher = (page: number) =>
    OrganizationsService.list({ page, pageSize: 20 });

  console.log('Collecting all organizations...');

  const allOrgs = await collectAll(fetcher);

  console.log(`Fetched ${allOrgs.length} organizations in total`);
  console.log('All organizations:', allOrgs);
}

// ========================================
// 6. React Component Example
// ========================================

function OrganizationListComponent() {
  const [orgs, setOrgs] = React.useState<Organization[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasNext, setHasNext] = React.useState(false);
  const [hasPrev, setHasPrev] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const fetchPage = async (pageNum: number) => {
    setLoading(true);

    try {
      const response = await OrganizationsService.list({
        page: pageNum,
        pageSize: 10,
      });

      if (response.status === 200 && response.data.data) {
        const data = response.data.data;
        setOrgs(data.results || []);
        setHasNext(hasNextPage(data));
        setHasPrev(hasPreviousPage(data));
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPage(page);
  }, [page]);

  return (
    <div>
      <h2>Organizations</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul>
            {orgs.map((org) => (
              <li key={org.id}>{org.name}</li>
            ))}
          </ul>

          <div>
            <button
              onClick={() => setPage(page - 1)}
              disabled={!hasPrev}
            >
              Previous
            </button>

            <span>Page {page}</span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasNext}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ========================================
// 7. Infinite Scroll Example
// ========================================

function InfiniteScrollComponent() {
  const [orgs, setOrgs] = React.useState<Organization[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const response = await OrganizationsService.list({
        page,
        pageSize: 20,
      });

      if (response.status === 200 && response.data.data) {
        const data = response.data.data;

        // Append new results to existing ones
        setOrgs((prev) => [...prev, ...(data.results || [])]);

        // Check if there are more pages
        setHasMore(hasNextPage(data));

        // Increment page for next load
        setPage(page + 1);
      }
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load first page on mount
  React.useEffect(() => {
    loadMore();
  }, []);

  return (
    <div>
      <h2>Organizations (Infinite Scroll)</h2>

      <ul>
        {orgs.map((org) => (
          <li key={org.id}>{org.name}</li>
        ))}
      </ul>

      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}

      {!hasMore && <p>No more organizations</p>}
    </div>
  );
}

// ========================================
// 8. Search with Pagination
// ========================================

async function searchWithPagination(query: string) {
  const response = await OrganizationsService.list({
    page: 1,
    pageSize: 10,
    search: query,
  });

  if (response.status === 200 && response.data.data) {
    const { results, count } = response.data.data;

    console.log(`Found ${count} organizations matching "${query}"`);
    console.log('Results:', results);
  }
}

// Run example
// searchWithPagination('acme');
