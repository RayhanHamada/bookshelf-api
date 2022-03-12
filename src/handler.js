const { nanoid } = require('nanoid');
const books = require('./books');

/**
 * @typedef {import('@hapi/hapi').Lifecycle.Method} Handler
 * @typedef {{
 * id: string,
 * name: string,
 * year: number,
 * author: string,
 * summary: string,
 * publisher: string,
 * pageCount: number,
 * readPage: number,
 * reading: boolean,
 * finished: boolean,
 * insertedAt: string,
 * updatedAt: string
 * }} Book
 */

/**
 * @type {Handler}
 */
const addBookHandler = (request, h) => {
  /**
   * destructure data terlebih dahulu
   */

  /**
   * @type {{
   * name: string,
   * year: number,
   * author: string,
   * summary: string,
   * publisher: string,
   * pageCount: number,
   * readPage: number,
   * reading: boolean,
   * }}
   */
  const pl = request.payload;

  /**
   * gagal bila Client tidak melampirkan properti "name" pada request body.
   */
  if (!pl.name || pl.name === '') {
    return h
      .response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      })
      .code(400);
  }

  /**
   * Gagal bila Client melampirkan nilai properti readPage
   * yang lebih besar dari nilai properti pageCount
   */
  if (pl.readPage && pl.pageCount && pl.readPage > pl.pageCount) {
    return h
      .response({
        status: 'fail',
        message:
          'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  }

  /**
   * jika tidak ada masalah kita bisa langsung generate id
   * dan tambahkan objek buku ke books
   */
  const id = nanoid(16);
  const date = new Date().toISOString();

  /**
   * @type {Book}
   */
  const newBook = {
    id,
    ...pl,
    finished: false,
    insertedAt: date,
    updatedAt: date,
  };

  books.push(newBook);

  /**
   * jika Server gagal memasukkan buku karena alasan umum (generic error)
   */
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (!isSuccess) {
    return h
      .response({
        status: 'error',
        message: 'Buku gagal ditambahkan',
      })
      .code(500);
  }

  /**
   * jika sukses
   */
  return h
    .response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    })
    .code(201);
};

/**
 * @type {Handler}
 */
const getAllBooksHandler = (request, h) => {
  const { query } = request;

  const queries = Object.getOwnPropertyNames(query);

  const filteredBooks = books

    /**
     * filter terhadap field query name
     */
    .filter((book) => {
      if (queries.includes('name')) {
        return book.name.toLowerCase().includes(query.name.toLowerCase());
      }

      return true;
    })

    /**
     * filter terhadap field query reading
     */
    .filter((book) => {
      if (queries.includes('reading')) {
        return book.reading === Boolean(query.reading);
      }
      return true;
    })

    /**
     * filter terhadap field query finished
     */
    .filter((book) => {
      if (queries.includes('finished')) {
        return book.finished === Boolean(query.finished);
      }

      return true;
    });

  return h
    .response({
      status: 'success',
      data: {
        books: filteredBooks.map((b) => ({
          id: b.id,
          name: b.name,
          publisher: b.publisher,
        })),
      },
    })
    .code(200);
};

/**
 * @type {Handler}
 */
const getBookByIdHandler = (request, h) => {
  /**
   * @type {{bookId: string}}
   */
  const { bookId } = request.params;

  const book = books.find((book) => book.id === bookId);

  /**
   * jika buku tidak ditemukan
   */
  if (!book) {
    return h
      .response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      })
      .code(404);
  }

  /**
   * jika buku ditemukan
   */
  return h
    .response({
      status: 'success',
      data: {
        book,
      },
    })
    .code(200);
};

/**
 * @type {Handler}
 */
const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const bookIndex = books.findIndex((b) => b.id === bookId);

  /**
   * Gagal bila buku tidak ditemukan
   */
  if (bookIndex === -1) {
    return h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      })
      .code(404);
  }

  /**
   * @type {{
   * name: string,
   * year: number,
   * author: string,
   * summary: string,
   * publisher: string,
   * pageCount: number,
   * readPage: number,
   * reading: boolean,
   * }}
   */
  const {
    name,
    author,
    pageCount,
    publisher,
    readPage,
    reading,
    summary,
    year,
  } = request.payload;

  /**
   * gagal bila Client tidak melampirkan properti "name" pada request body.
   */
  if (!name || name === '') {
    return h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      })
      .code(400);
  }

  /**
   * Gagal bila Client melampirkan nilai properti readPage
   * yang lebih besar dari nilai properti pageCount
   */
  if (readPage && pageCount && readPage > pageCount) {
    return h
      .response({
        status: 'fail',
        message:
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  }

  books[bookIndex] = {
    ...books[bookIndex],
    name,
    author,
    pageCount,
    publisher,
    readPage,
    reading,
    summary,
    year,
  };

  return h
    .response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    })
    .code(200);
};

/**
 * @type {Handler}
 */
const deleteBookByIdHandler = (request, h) => {
  /**
   * @type {{bookId: string}}
   */
  const { bookId } = request.params;

  const bookIndex = books.findIndex((book) => book.id === bookId);

  /**
   * jika buku tidak ditemukan
   */
  if (bookIndex === -1) {
    return h
      .response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      })
      .code(404);
  }

  books.splice(bookIndex);

  /**
   * jika sukses
   */
  return h
    .response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    })
    .code(200);
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
