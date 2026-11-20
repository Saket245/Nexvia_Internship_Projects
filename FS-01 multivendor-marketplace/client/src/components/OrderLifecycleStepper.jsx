import React, { useState } from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, Home, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';

const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Clock, desc: 'Payment verified' },
  { key: 'packed', label: 'Packed', icon: PackageCheck, desc: 'Boxed by merchant' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'Carrier in transit' },
  { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Package arrived' }
];

export const OrderLifecycleStepper = ({ order, onStatusUpdated, allowSimulation = true }) => {
  const [updating, setUpdating] = useState(false);
  const currentStatus = order?.orderStatus || 'placed';

  const getCurrentStepIndex = () => {
    switch (currentStatus) {
      case 'placed': return 0;
      case 'packed': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentIndex = getCurrentStepIndex();

  const handleSimulateNextStep = async () => {
    if (currentIndex >= 3) return;
    const nextStep = STEPS[currentIndex + 1].key;
    setUpdating(true);
    try {
      const res = await api.updateOrderStatus(order._id, nextStep, `Status updated to ${nextStep}`);
      if (res.success && onStatusUpdated) {
        onStatusUpdated(res.order);
      }
    } catch (err) {
      console.warn('Status update failed', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSimulateStepDirect = async (stepKey) => {
    setUpdating(true);
    try {
      const res = await api.updateOrderStatus(order._id, stepKey, `Status transitioned to ${stepKey}`);
      if (res.success && onStatusUpdated) {
        onStatusUpdated(res.order);
      }
    } catch (err) {
      console.warn('Status update failed', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfillment Tracker</span>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
            Status: <span className="capitalize text-emerald-600 font-extrabold">{currentStatus}</span>
          </h3>
        </div>

        {allowSimulation && (
          <div className="flex items-center gap-2">
            {currentIndex < 3 && (
              <button
                onClick={handleSimulateNextStep}
                disabled={updating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                {updating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                Advance to {STEPS[currentIndex + 1]?.label}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="relative mb-8 px-2 sm:px-6">
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full z-0"></div>

        <div
          className="absolute top-1/2 left-8 -translate-y-1/2 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full z-0 transition-all duration-700 ease-out"
          style={{ width: `${(currentIndex / 3) * 88}%` }}
        ></div>

        <div className="relative z-10 flex justify-between">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!allowSimulation}
                  onClick={() => handleSimulateStepDirect(step.key)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-50'
                      : 'bg-white text-slate-400 border-2 border-slate-200 hover:border-slate-300'
                  } ${isCurrent ? 'scale-110' : ''}`}
                >
                  <StepIcon className="w-5 h-5" />
                </button>

                <div className="mt-3 text-center">
                  <div className={`text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {order?.timeline && order.timeline.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider text-[11px]">Milestone Updates</div>
          <div className="space-y-2.5">
            {order.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-slate-900 capitalize">{event.status}:</span>{' '}
                  <span className="text-slate-600">{event.note || 'Status updated'}</span>
                </div>
                <div className="text-slate-400 text-[11px] shrink-0 font-medium">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
