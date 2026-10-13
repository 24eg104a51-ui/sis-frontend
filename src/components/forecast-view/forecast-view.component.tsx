import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Product, ForecastResult } from '../../models/inventory.models';
import * as api from '../../services/api.service';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ForecastViewComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [forecastResults, setForecastResults] = useState<ForecastResult[]>([]);
  const [forecastDays, setForecastDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const query = useQuery();

  useEffect(() => {
    loadProducts();
    const productId = query.get('productId');
    if (productId) {
      setSelectedProductId(+productId);
    }
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId) || null;
      setSelectedProduct(product);
      if (product) {
        loadForecast();
      }
    } else {
      setSelectedProduct(null);
      setForecastResults([]);
    }
  }, [selectedProductId, products]);

  async function loadProducts() {
    try {
      const data = await api.getAllProducts();
      setProducts(data);
      setError('');
    } catch {
      setError('Unable to load products. Check that the backend is running.');
    }
  }

  async function loadForecast() {
    if (!selectedProductId) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getForecastHistory(selectedProductId);
      setForecastResults(data);
    } catch {
      setError('Unable to load forecast history. Check the backend and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function generateForecast() {
    if (!selectedProductId) return;
    setGenerating(true);
    setError('');
    setMessage('');
    try {
      const data = await api.generateMultiDayForecast(selectedProductId, forecastDays);
      setForecastResults(data);
      setMessage(`Generated ${data.length} forecast days for ${selectedProduct?.name ?? 'the selected product'}.`);
    } catch {
      setError('Forecast generation failed. Check the backend and try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function generateAllForecasts() {
    if (products.length === 0) {
      setError('Add a product before generating forecasts.');
      return;
    }
    setGenerating(true);
    setError('');
    setMessage('');
    try {
      const results = await Promise.allSettled(
        products.map((product) => api.generateMultiDayForecast(product.id!, 30))
      );
      const succeeded = results.filter((result) => result.status === 'fulfilled').length;
      const failed = results.length - succeeded;
      setMessage(`Generated forecasts for ${succeeded} of ${results.length} products.`);
      if (failed > 0) setError(`${failed} product forecast${failed === 1 ? '' : 's'} could not be generated.`);
      if (selectedProductId) await loadForecast();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h3 mb-0">Demand Forecasts</h1>
          <p className="text-muted">AI-powered demand predictions using Weka ML</p>
        </div>
        <div className="col-md-6 text-md-end">
          <div className="btn-group">
            <button
              className="btn btn-outline-primary"
              onClick={generateAllForecasts}
              disabled={generating}
            >
              <i className="bi bi-magic me-2"></i>
              {generating ? 'Generating...' : 'Generate All Forecasts'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-medium">Select Product</label>
                  <select
                    className="form-select"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value ? +e.target.value : '')}
                  >
                    <option value="">Choose a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.currentStock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Forecast Days</label>
                  <input
                    type="number"
                    className="form-control"
                    value={forecastDays}
                    onChange={(e) => setForecastDays(e.target.value === '' ? 0 : +e.target.value)}
                    min="1"
                    max="90"
                    placeholder="30"
                  />
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100"
                    onClick={generateForecast}
                    disabled={!selectedProductId || forecastDays < 1 || forecastDays > 90 || generating}
                  >
                    <i className="bi bi-graph-up-arrow me-2"></i>Generate Forecast
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && forecastResults.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Forecast for {selectedProduct.name}</h5>
                <span className="badge bg-primary">
                  {forecastResults.length} day forecast
                </span>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Predicted Demand</th>
                        <th>Confidence Range</th>
                        <th>Model</th>
                        <th>Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastResults.map((forecast) => (
                        <tr key={forecast.id}>
                          <td>
                            {new Date(forecast.forecastDate).toLocaleDateString()}
                          </td>
                          <td>
                            <strong>{forecast.predictedDemand}</strong> units
                          </td>
                          <td>
                            {forecast.confidenceLower} - {forecast.confidenceUpper}
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {forecast.modelUsed || '-'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="flex-grow-1" style={{ height: '6px' }}>
                                <div
                                  className="progress-bar bg-success"
                                  style={{
                                    width: `${(forecast.accuracyScore || 0) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <small>
                                {forecast.accuracyScore
                                  ? Math.round(forecast.accuracyScore * 100)
                                  : 0}
                                %
                              </small>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && forecastResults.length === 0 && !loading && (
        <div className="text-center py-5">
          <i className="bi bi-graph-up display-1 text-muted mb-3"></i>
          <h4 className="text-muted">No forecast data</h4>
          <p className="text-muted">
            Click "Generate Forecast" to create AI-powered demand predictions
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForecastViewComponent;
