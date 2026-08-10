import React from 'react';

export default function QuoteNegotiationCard({ quote, onRespond }) {
  if (!quote) return null;

  const isPending = quote.quoteStatus === 'Pending Counter';

  return (
    <div className="my-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Custom Price Offer</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          quote.quoteStatus === 'Accepted' ? 'bg-green-100 text-green-800' :
          quote.quoteStatus === 'Declined' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {quote.quoteStatus}
        </span>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-extrabold text-gray-900 dark:text-white">${quote.proposedPrice}</span>
        <span className="text-sm text-gray-500 line-through">${quote.originalEstimate}</span>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300">{quote.customScopeTerms}</p>

      {isPending && (
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => onRespond(quote._id, 'Accept')}
            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow"
          >
            Accept Price
          </button>
          <button
            onClick={() => onRespond(quote._id, 'Decline')}
            className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-xs font-bold rounded-lg"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
