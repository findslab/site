const pagination = (total = 1, page = 1, perPage = 10, pagenum = 10) => {
  const pageNum = Number(page);
  const pageSet = perPage; //한 페이지에 보여줄 데이터 수
  const blockSet = pagenum; //한 페이지에 보여줄 블럭 수
  const minPage = 1;
  const maxPage = Math.ceil(total / pageSet); //전체 페이징 수

  const block = Math.ceil(pageNum / blockSet); //현재 블락

  const firstPage = ((block - 1) * blockSet) + 1; // 첫번째 페이지번호
  const lastPage = Math.min(maxPage, block * blockSet); // 마지막 페이지번호

  const prevPage = pageNum - 1; // 이전페이지
  const nextPage = pageNum + 1; // 다음페이지

  const bigPrevPage = ((Math.ceil(page / pagenum) - 2) * 10) + 1 < minPage ? minPage : ((Math.ceil(page / pagenum) - 2) * 10) + 1;
  const bigNextPage = (Math.ceil(page / pagenum) * 10) + 1 > maxPage ? maxPage : (Math.ceil(page / pagenum) * 10) + 1;

  const pageBlock = [];
  for (let i = firstPage; i <= lastPage; i++) {
    pageBlock.push(i);
  }

  const preventPrevPage = Number(page) === 1;
  const preventNextPage = Number(page) === maxPage || total === 0;

  return {
    maxPage,
    prevPage,
    nextPage,
    bigPrevPage,
    bigNextPage,
    preventPrevPage,
    preventNextPage,
    pageBlock,
  };
}

export default pagination;
