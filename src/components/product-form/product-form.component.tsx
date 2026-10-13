import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Product } from '../../models/inventory.models';
import * as api from '../../services/api.service';

function ProductFormComponent() {
  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    currentStock: 0,
    minStockThreshold: 10,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [priceTouched, setPriceTouched] = useState(false);
  const [stockTouched, setStockTouched] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      api
        .getProduct(+id)
        .then((p) => setProduct(p))
        .catch(() => navigate('/products'));
    }
  }, [id]);

  const nameInvalid = !product.name.trim();
  const priceInvalid = !Number.isFinite(product.price) || product.price < 0;
  const stockInvalid = !Number.isInteger(product.currentStock) || product.currentStock < 0;

  async function onSubmit() {
    setSaving(true);
    setError('');
    try {
      if (isEditMode && product.id) {
        await api.updateProduct(product.id, product);
      } else {
        await api.createProduct(product);
      }
      navigate('/products');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  {isEditMode ? 'Edit Product' : 'Add New Product'}
                </h4>
                <Link to="/products" className="btn btn-sm btn-outline-secondary">
                  <i className="bi bi-arrow-left me-1"></i>Back
                </Link>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => { e.preventDefault(); void onSubmit(); }}>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Product Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={product.name}
                      onChange={(e) =>
                        setProduct({ ...product, name: e.target.value })
                      }
                      onBlur={() => setNameTouched(true)}
                      maxLength={100}
                    />
                    {nameInvalid && nameTouched && (
                      <div className="form-text">Product name is required</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Price <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={product.price}
                        onChange={(e) =>
                          setProduct({ ...product, price: +e.target.value })
                        }
                        onBlur={() => setPriceTouched(true)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {priceInvalid && priceTouched && (
                      <div className="form-text">Valid price is required</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Description</label>
                  <textarea
                    className="form-control"
                    value={product.description || ''}
                    onChange={(e) =>
                      setProduct({ ...product, description: e.target.value })
                    }
                    rows={3}
                    maxLength={500}
                    placeholder="Product description..."
                  ></textarea>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Current Stock <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={product.currentStock}
                      onChange={(e) =>
                        setProduct({ ...product, currentStock: +e.target.value })
                      }
                      onBlur={() => setStockTouched(true)}
                      min="0"
                    />
                    {stockInvalid && stockTouched && (
                      <div className="form-text">Stock quantity is required</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Min Stock Threshold
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={product.minStockThreshold ?? ''}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          minStockThreshold: +e.target.value || undefined,
                        })
                      }
                      min="0"
                      placeholder="Default: 10"
                    />
                    <div className="form-text">
                      Alert when stock falls below this level
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/products')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={nameInvalid || priceInvalid || stockInvalid || saving}
                  >
                    {saving && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    {isEditMode ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFormComponent;
