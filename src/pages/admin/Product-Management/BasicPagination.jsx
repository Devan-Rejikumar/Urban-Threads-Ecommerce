import React from 'react';

const BasicPagination = ({ count, onChange }) => {
  return (
    <div className="pagination">
      {Array.from({ length: count }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={(e) => onChange(e, page)}
          className="pagination-button"
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default BasicPagination;

