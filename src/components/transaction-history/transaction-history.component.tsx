import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Product, Transaction, Page } from '../../models/inventory.models';
import * as api from '../../services/api.service';

function TransactionHistoryComponent() {
  const [product, setProduct] = useState<Product | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pageInfo, setPageInfo] = useState<Page<any> | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [filterApplied, setFilterApplied] = useState(false);
  const pageSize = 20;
  const today = new Date().toISOString().split('T')[0];
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      loadProduct(+productId);
      const defaultEndDate = today;
      setEndDate(defaultEndDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    } else {
      navigate('/products');
    }
  }, [productId]);

  useEffect(() => {
    if (productId && product && startDate && endDate) {
      void loadTransactions();
    }
  }, [currentPage, productId, product]);

  async function loadProduct(id: number) {
    try {
      const data = await api.getProduct(id);
      setProduct(data);
    } catch {
      navigate('/products');
    }
  }

  async function loadTransactions(useDateFilter = filterApplied) {
    if (!product) return;
    setLoading(true);
    setError('');
    try {
      if (useDateFilter && startDate && endDate) {
        const [periodTransactions, sales] = await Promise.all([
          api.getTransactionsInPeriod(product.id!, startDate, endDate),
          api.getTotalSalesInPeriod(product.id!, startDate, endDate),
        ]);
        setTransactions(periodTransactions);
        setPageInfo(null);
        setTotalSales(sales);
      } else {
        const [page, sales] = await Promise.all([
          api.getProductTransactions(product.id!, currentPage, pageSize),
          api.getTotalSalesInPeriod(product.id!, startDate, endDate),
        ]);
        setTransactions(page.content);
        setPageInfo(page);
        setTotalSales(sales);
      }
    } catch {
      setError('Unable to load transactions for this product and date range.');
    } finally {
      setLoading(false);
    }
  }

  function changePage(page: number) {
    if (page >= 0 && pageInfo && page < pageInfo.totalPages) {
      setCurrentPage(page);
    }
  }

  function getPageArray(): number[] {
    if (!pageInfo) return [];
    const total = pageInfo.totalPages;
    const current = pageInfo.number;
    const pages: number[] = [];
    for (let i = Math.max(0, current - 2); i < Math.min(total, current + 3); i++) {
      pages.push(i);
    }
    return pages;
  }

  async function deleteTransaction(id: number) {
    if (confirm('Delete this transaction? This will also adjust product stock.')) {
      try {
        await api.deleteTransaction(id);
        await loadTransactions();
      } catch {
        setError('Unable to delete this transaction. Please try again.');
      }
    }
  }

  function getTransactionBadgeClass(type: string): string {
    switch (type) {
      case 'PURCHASE':
        return 'bg-success';
      case 'SALE':
        return 'bg-danger';
      case 'RETURN':
        return 'bg-info text-dark';
      case 'ADJUSTMENT':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h3 mb-0">Transaction History</h1>
          <p className="text-muted">
            for {product?.name || ''}
          </p>
        </div>
        <div className="col-md-4 text-md-end">
          <Link to="/products" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to Products
          </Link>
        </div>
      </div>

      {product && (
        <>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label fw-medium">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={endDate || today}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-medium">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        max={today}
                      />
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => {
                          setCurrentPage(0);
                          setFilterApplied(true);
                          void loadTransactions(true);
                        }}
                      >
                        <i className="bi bi-filter me-2"></i>Filter
                      </button>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex justify-content-end">
                        <span className="badge bg-primary fs-6">
                          Total Sales: {totalSales} units
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th>Notes</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id}>
                        <td>
                          {txn.transactionDate
                            ? new Date(txn.transactionDate).toLocaleString()
                            : '-'}
                        </td>
                        <td>
                          <span
                            className={`badge ${getTransactionBadgeClass(txn.transactionType)}`}
                          >
                            {txn.transactionType}
                          </span>
                        </td>
                        <td>{txn.quantity}</td>
                        <td>${txn.unitPrice.toFixed(2)}</td>
                        <td>${(txn.totalAmount || 0).toFixed(2)}</td>
                        <td>{txn.notes || '-'}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteTransaction(txn.id!)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && !loading && (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <i className="bi bi-clock-history display-1 d-block mb-2"></i>
                          No transactions found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {pageInfo && (
              <div className="card-footer bg-white border-0">
                <nav>
                  <ul className="pagination pagination-sm mb-0 justify-content-center">
                    <li
                      className={`page-item ${pageInfo.number === 0 ? 'disabled' : ''}`}
                    >
                      <button type="button" className="page-link" disabled={pageInfo.first} onClick={() => changePage(pageInfo.number - 1)}>
                        Previous
                      </button>
                    </li>
                    {getPageArray().map((p) => (
                      <li
                        key={p}
                        className={`page-item ${p === pageInfo.number ? 'active' : ''}`}
                      >
                        <button type="button" className="page-link" aria-current={p === pageInfo.number ? 'page' : undefined} onClick={() => changePage(p)}>
                          {p + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pageInfo.last ? 'disabled' : ''}`}>
                      <button type="button" className="page-link" disabled={pageInfo.last} onClick={() => changePage(pageInfo.number + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TransactionHistoryComponent;
