import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, Page } from '../../models/inventory.models';
import * as api from '../../services/api.service';

function ProductListComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pageInfo, setPageInfo] = useState<Page<Product> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadProducts(), 250);
    return () => window.clearTimeout(timeout);
  }, [currentPage, searchQuery]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      if (searchQuery.trim()) {
        const data = await api.searchProducts(searchQuery);
        setProducts(data);
        setPageInfo(null);
      } else {
        const data = await api.getProducts(currentPage, pageSize);
        setProducts(data.content);
        setPageInfo(data);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load products.');
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

  async function deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        await loadProducts();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete product.');
      }
    }
  }

  function getStockStatus(product: Product): string {
    if (product.currentStock === 0) return 'Out of Stock';
    if (product.currentStock <= (product.minStockThreshold || 10))
      return 'Low Stock';
    return 'In Stock';
  }

  function getStockBadgeClass(product: Product): string {
    if (product.currentStock === 0) return 'bg-danger';
    if (product.currentStock <= (product.minStockThreshold || 10))
      return 'bg-warning text-dark';
    return 'bg-success';
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h3 mb-0">Products</h1>
          <p className="text-muted">Manage your inventory products</p>
        </div>
        <div className="col-md-6 text-md-end">
          <Link to="/products/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>Add Product
          </Link>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        {error && <div className="alert alert-danger m-3 mb-0" role="alert">{error}</div>}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="fw-medium">{product.name}</div>
                      <small className="text-muted">
                        {product.description || 'No description'}
                      </small>
                    </td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.currentStock}</td>
                    <td>{product.minStockThreshold}</td>
                    <td>${(product.price * product.currentStock).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStockBadgeClass(product)}`}>
                        {getStockStatus(product)}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/transactions/${product.id}`}
                          className="btn btn-outline-primary"
                          title="View Transactions"
                        >
                          <i className="bi bi-clock-history"></i>
                        </Link>
                        <Link
                          to={`/forecasts?productId=${product.id}`}
                          className="btn btn-outline-success"
                          title="View Forecast"
                        >
                          <i className="bi bi-graph-up"></i>
                        </Link>
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="btn btn-outline-secondary"
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => deleteProduct(product.id!)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <i className="bi bi-box-seam display-1 d-block mb-2"></i>
                      No products found. Click "Add Product" to get started.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">Loading products...</td>
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
                <li className={`page-item ${pageInfo.number === 0 ? 'disabled' : ''}`}>
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
    </div>
  );
}

export default ProductListComponent;
