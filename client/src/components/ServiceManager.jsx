import { useState, useEffect , useCallback} from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Clock,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import {
  addWorkerService,
  updateWorkerService,
  removeWorkerService,
  getMyServices,
  updateHourlyRate,
} from '../services/workerService';
import useToast from '../hooks/useToast';

const ServiceManager = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '60',
    isActive: true,
  });

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyServices();
      setServices(data.services || []);
      setHourlyRate(data.hourlyRate || 0);
    } catch (err) {
      console.error('Failed to load services:', err);
      showToast('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', duration: '60', isActive: true });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      duration: String(service.duration || 60),
      isActive: service.isActive,
    });
    setEditingService(service._id || service.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Service name and price are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
        isActive: formData.isActive,
      };

      if (editingService) {
        await updateWorkerService(editingService, payload);
        showToast('Service updated successfully', 'success');
      } else {
        await addWorkerService(payload);
        showToast('Service added successfully', 'success');
      }

      resetForm();
      await loadServices();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save service', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to remove this service?')) return;

    try {
      await removeWorkerService(serviceId);
      showToast('Service removed successfully', 'success');
      await loadServices();
    } catch (err) {
      showToast('Failed to remove service', 'error');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await updateWorkerService(service._id || service.id, {
        isActive: !service.isActive,
      });
      await loadServices();
    } catch (err) {
      showToast('Failed to update service', 'error');
    }
  };

  const handleHourlyRateUpdate = async () => {
    if (hourlyRate < 0) return;
    try {
      await updateHourlyRate(Number(hourlyRate));
      showToast('Hourly rate updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update hourly rate', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hourly Rate Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          Default Hourly Rate
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Set your default hourly rate. This is used for quick filtering and as a fallback
          when no specific service is selected.
        </p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-8 pr-4 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="0.00"
            />
          </div>
          <button
            onClick={handleHourlyRateUpdate}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Service Catalog</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage the services you offer to clients
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'New Service'}
              </h4>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="e.g., Electrical Wiring, Pipe Repair"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  rows={2}
                  placeholder="Brief description of this service..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingService ? 'Update Service' : 'Add Service'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
            <p className="text-gray-500 font-medium">No services added yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Add Service" to create your service catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service._id || service.id}
                className={`rounded-xl border p-5 transition relative ${
                  service.isActive
                    ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    : 'border-gray-100 bg-gray-50 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-sm">{service.name}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className="p-1 rounded hover:bg-gray-100 transition"
                      title={service.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {service.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-1 rounded hover:bg-blue-50 transition"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id || service.id)}
                      className="p-1 rounded hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {service.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{service.description}</p>
                )}

                <div className="flex items-center gap-3 text-sm font-medium">
                  <span className="flex items-center gap-1 text-blue-600 font-bold">
                    <DollarSign className="h-3.5 w-3.5" />
                    ${Number(service.price).toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration || 60} min
                  </span>
                </div>

                <div className="mt-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      service.isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManager;

