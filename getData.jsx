const Pagination = ({ activePage, items, pageSize, onPageChange }) => {
  const { Pagination } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map(page => {
    return (
      <Pagination.Item key={page} onClick={onPageChange} active={activePage === page}>{page}
      </Pagination.Item>
    );
  });
  return (
    <nav className="d-flex justify-content-center">
      <Pagination>
        <Pagination.Prev />
        {list}
        <Pagination.Next />
      </Pagination>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [activePage, setActivePage] = useState(1)
  const pageSize = 10;
  const { InputGroup, FormControl, Button, Col, Row, Container, ListGroup } = ReactBootstrap;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    `https://hn.algolia.com/api/v1/search?query=${query}`,
    {
      hits: []
    }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
    setActivePage(Number(e.target.textContent));
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment >
      <div className="min-vh-100 d-flex flex-column">
        <header className="bg-info">
          <Container>
            <Row>
              <h1 className="mb-4 text-light fs-1 fw-bold text-center">React Get Data</h1>
            </Row>
            <Row>
              <Col lg="5">
                <form
                  onSubmit={event => {
                    doFetch(`http://hn.algolia.com/api/v1/search?query=${query}`);
                    event.preventDefault();
                  }}
                >
                  <InputGroup className="mb-3">
                    <FormControl
                      placeholder="Search"
                      aria-label="Search"
                      aria-describedby="basic-addon2"
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                    />
                    <Button type="submit" variant="dark" id="button-addon2">Search</Button>
                  </InputGroup>
                </form>
              </Col>
            </Row>
          </Container>
        </header>
        <main className="flex-grow-1">
          <Container>
            <Row className="mt-5">
              <Col lg="12">
                {isError && <div>Something went wrong ...</div>}

                {isLoading ? (
                  <div>Loading ...</div>
                ) : (
                  <ListGroup>
                    {page.map(item => (
                      <ListGroup.Item key={item.objectID} action href={item.url}>{item.title}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Col>
            </Row>
            <Row className="mt-5">
              <Pagination
                activePage={activePage}
                items={data.hits}
                pageSize={pageSize}
                onPageChange={handlePageChange}>
              </Pagination>
            </Row>
          </Container>
        </main>
        <footer><p className="text-center">Sean@2021</p></footer>
      </div>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
