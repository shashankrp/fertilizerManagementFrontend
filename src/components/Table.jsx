import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Table = ({ headers, data, renderRow, className }) => {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm", className)}>
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {data.length > 0 ? (
            data.map((item, idx) => (
              <tr key={idx} className="hover:bg-stone-50 transition-colors">
                {renderRow(item)}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-stone-400 font-medium">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
