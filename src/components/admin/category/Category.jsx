

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { Plus, Search, Edit, MoreVertical, Check, X, Trash } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCategory from '../../../pages/admin/Category-Management/Add-Category';
import EditCategory from '../../../pages/admin/Category-Management/Edit-Category';
import BasicPagination from '../../../pages/admin/Category-Management/BasicPagination';
import AdminBreadcrumbs from '../../../pages/admin/Category-Management/AdminBreadcrumbs';
import './Category.css';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editTab, setEditTab] = useState(false);
  const [addTab, setAddTab] = useState(false);
  const actionMenuRefs = useRef({});
  const [page, setPage] = useState(1);
  const [categoriesPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories", {
        withCredentials: true
      });
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error('Invalid data format:', response.data);
        toast.error('Invalid data format');
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Fetch Categories Error:', error);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter(cat => !cat.isDeleted)
      .filter(cat => {
        const matchesSearch = !searchQuery ||
          cat.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
  }, [categories, searchQuery]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const pageCount = Math.ceil(filteredCategories.length / categoriesPerPage);
  const startIndex = (page - 1) * categoriesPerPage;
  const currentCategories = filteredCategories.slice(startIndex, startIndex + categoriesPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleActionMenu = (categoryId) => {
    setOpenActionMenuId(openActionMenuId === categoryId ? null : categoryId);
  };

  const handleActive = async (item) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/categories/${item._id}`,
        { isActive: !item.isActive },
        { withCredentials: true }
      );

      setCategories(categories.map(cat =>
        cat._id === item._id
          ? { ...cat, isActive: !cat.isActive }
          : cat
      ));

      toast.success(`Category ${item.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error("Error updating category status:", error);
      toast.error("Failed to update category status");
    }
  };
  const handleDelete = async (item) => {
    try {
      await axios.put(
        `http://localhost:5000/api/categories/${item._id}`,
        { isDeleted: true },
        { withCredentials: true }
      );
      setCategories(categories.map(cat =>
        cat._id === item._id
          ? { ...cat, isDeleted: true }
          : cat
      ));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setEditTab(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(actionMenuRefs.current).some(ref => ref && ref.contains(event.target))) {
        setOpenActionMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderContent = () => {
    if (addTab) {
      return (
        <>
          <AdminBreadcrumbs additionalCrumb="Add Category" />
          <AddCategory
            onSave={(newCategory) => {
              if (newCategory) {
                setCategories(prev => [...prev, newCategory]);
              }
              setAddTab(false);
            }}
            onCancel={() => setAddTab(false)}
            onUpdateSuccess={fetchCategories}
          />
        </>
      );
    }

    if (editTab && selectedCategory) {
      return (
        <>
          <AdminBreadcrumbs additionalCrumb="Edit Category" />
          <EditCategory
            category={selectedCategory}
            onCancel={() => setEditTab(false)}
            onUpdateSuccess={fetchCategories}
          />
        </>
      );
    }

    return (
      <div className="category-dashboard">
        <div className="category-dashboard-header">
          <div className="category-header-left">
            <h1>Category</h1>
            <AdminBreadcrumbs />
          </div>
          <div className="category-header-actions">
            <button className="btn btn-primary" onClick={() => setAddTab(true)}>
              <Plus size={16} className="btn-icon" />
              Add New Category
            </button>
          </div>
        </div>

        <div className="category-search-bar">
          <div className="search-icon-wrapper">
            <Search size={16} className="search-icon" />
          </div>
          <input
            type="text"
            placeholder="Search category..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="category-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Added Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={item.image?.url || "/placeholder.svg?height=50&width=50"}
                      alt={item.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  </td>

                  <td>
                    <div className="product-name">
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td>{item.description}</td>
                  <td>
                    <span className={`status-badge ${item.isActive ? "active" : "blocked"}`}>
                      {item.isActive ? "Active" : "Non-Active"}
                    </span>
                  </td>
                  <td>{format(new Date(item.createdAt), 'dd MMM yyyy')}</td>
                  <td>
                    <div
                      className="action-wrapper"
                      ref={(el) => actionMenuRefs.current[item._id] = el}
                    >
                      <div className="action-container">
                        <button
                          className="action-menu-trigger"
                          onClick={() => toggleActionMenu(item._id)}
                        >
                          <MoreVertical size={20} className="vertical-dot" />
                        </button>
                        {openActionMenuId === item._id && (
                          <div className="action-dropdown">
                            <button
                              className="dropdown-item"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit size={16} className="dropdown-icon" />
                              Edit
                            </button>
                            <button
                              className={`dropdown-item ${item.isActive ? 'active' : 'inactive'}`}
                              onClick={() => handleActive(item)}
                            >
                              {item.isActive ? (
                                <>
                                  <Check size={16} className="dropdown-icon" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <X size={16} className="dropdown-icon" />
                                  Inactive
                                </>
                              )}
                            </button>
                            <button
                              className="dropdown-item delete"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash size={16} className="dropdown-icon" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="pagination-wrapper">
            <BasicPagination
              page={page}
              count={pageCount}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ToastContainer />
      {renderContent()}
    </>
  );
};

export default Category;
