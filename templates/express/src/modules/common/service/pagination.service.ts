export interface PageQuery {
  page?: number;
  size?: number;
}

export const parsePageQuery = (query: PageQuery) => {
  const page = Number.isFinite(query.page) && (query.page ?? 0) >= 0 ? Number(query.page) : 0;
  const size = Number.isFinite(query.size) && (query.size ?? 10) > 0 ? Math.min(Number(query.size), 100) : 10;

  return {
    page,
    size,
    skip: page * size,
    take: size
  };
};

export const toPageResponse = <T>(items: T[], total: number, page: number, size: number) => ({
  content: items,
  pageable: { pageNumber: page, pageSize: size },
  totalElements: total,
  totalPages: Math.ceil(total / size),
  first: page === 0,
  last: page >= Math.ceil(total / size) - 1,
  number: page,
  size,
  numberOfElements: items.length,
  empty: items.length === 0
});
