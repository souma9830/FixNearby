import React from 'react';

export default function SubscriptionPlanCard({ subscription, onToggleStatus }) {
  if (!subscription) return null;

  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 flex justify-between items-center">
      <div>
        <div className="flex items-center space-x-2">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{subscription.serviceCategory}</h4>
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
            subscription.subscriptionStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
          }`}>
            {subscription.subscriptionStatus}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Frequency: {subscription.recurrenceFrequency} | Next Booking: {new Date(subscription.nextBookingDate).toLocaleDateString()}
        </p>
      </div>

      <div className="text-right">
        <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
          ${subscription.billingAmountPerCycle}<span className="text-xs text-gray-400">/cycle</span>
        </div>
        <button
          onClick={() => onToggleStatus(subscription._id, subscription.subscriptionStatus === 'Active' ? 'Paused' : 'Active')}
          className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
        >
          {subscription.subscriptionStatus === 'Active' ? 'Pause Plan' : 'Resume Plan'}
        </button>
      </div>
    </div>
  );
}
