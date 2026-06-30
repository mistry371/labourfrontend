'use client';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import type { StepProps } from './types';
import { ServiceCategory } from '@/types';
import api from '@/lib/api';

export function StepService({ draft, update, onNext }: StepProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the 2-level category tree from backend
    api.get<ServiceCategory[]>('/api/v1/categories/tree')
      .then((res) => {
        setCategories(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCategory = categories.find((c) => c.id === draft.categoryId);

  const canProceed = !!draft.categoryId && !!draft.serviceId;

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading catalog...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 1. Category */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">What do you need help with?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => update({ categoryId: cat.id, categoryName: cat.name, serviceId: '', serviceName: '' })}
              className={clsx(
                'relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95',
                draft.categoryId === cat.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300'
              )}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className={clsx('text-sm font-semibold', draft.categoryId === cat.id ? 'text-blue-700' : 'text-gray-800')}>{cat.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Service */}
      {selectedCategory?.children && selectedCategory.children.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h2 className="text-md font-bold text-gray-900 mb-3">Select Specific Service</h2>
          <div className="space-y-3">
            {selectedCategory.children.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => update({ serviceId: service.id, serviceName: service.name })}
                className={clsx(
                  'w-full p-4 rounded-xl border-2 text-left transition-all active:scale-95 flex flex-col gap-1',
                  draft.serviceId === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
                )}
              >
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-gray-900">{service.name}</p>
                  <p className="text-blue-600 font-bold">₹{service.basePrice}</p>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-500">{service.description}</p>
                )}
                {service.estimatedDuration && (
                  <p className="text-xs text-gray-400 mt-1">⏳ {service.estimatedDuration}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-6 border-t flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
