import React from "react";
import { Pagination } from "react-bootstrap";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <Pagination size="sm" className="justify-content-end">
      {Array.from({ length: totalPages }, (_, index) => (
        <Pagination.Item
          key={index}
          onClick={() => onPageChange(index + 1)}
          active={currentPage === index + 1}
        >
          {index + 1}
        </Pagination.Item>
      ))}
    </Pagination>
  );
};

export default PaginationComponent;
