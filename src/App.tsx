import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar/navbar.component';
import DashboardComponent from './components/dashboard/dashboard.component';
import ProductListComponent from './components/product-list/product-list.component';
import ProductFormComponent from './components/product-form/product-form.component';
import ForecastViewComponent from './components/forecast-view/forecast-view.component';
import TransactionHistoryComponent from './components/transaction-history/transaction-history.component';

function App() {
  return (
    <>
      <Navbar />
      <main className="min-vh-100 bg-light">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardComponent />} />
          <Route path="/products" element={<ProductListComponent />} />
          <Route path="/products/new" element={<ProductFormComponent />} />
          <Route path="/products/edit/:id" element={<ProductFormComponent />} />
          <Route path="/forecasts" element={<ForecastViewComponent />} />
          <Route path="/transactions/:productId" element={<TransactionHistoryComponent />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
