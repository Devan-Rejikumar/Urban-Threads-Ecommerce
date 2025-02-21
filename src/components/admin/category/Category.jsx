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
      await axios.delete(
        `http://localhost:5000/api/categories/${item._id}`,
        { withCredentials: true }
      );
      
      // Remove the category from the state
      setCategories(categories.filter(cat => cat._id !== item._id));
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
      <div className="container-fluid dashboard-container">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div className="dashboard-title">
                <h1 className="h2 mb-2">Category Management</h1>
                <AdminBreadcrumbs />
              </div>
              <button 
                className="btn btn-primary d-flex align-items-center" 
                onClick={() => setAddTab(true)}
              >
                <Plus size={18} className="me-2" />
                Add New Category
              </button>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="search-container mb-4">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search category..."
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Image</th>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Added Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCategories.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <img
                              src={item.image?.url || "/placeholder.svg?height=50&width=50"}
                              alt={item.name}
                              className="category-image"
                            />
                          </td>
                          <td>
                            <span className="fw-medium">{item.name}</span>
                          </td>
                          <td>
                            <span className="text-muted">{item.description}</span>
                          </td>
                          <td>
                            <span className={`badge ${item.isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                              {item.isActive ? "Active" : "Non-Active"}
                            </span>
                          </td>
                          <td>{format(new Date(item.createdAt), 'dd MMM yyyy')}</td>
                          <td>
                            <div className="action-wrapper text-end" ref={(el) => actionMenuRefs.current[item._id] = el}>
                              <div className="dropdown">
                                <button
                                  className="btn btn-light btn-sm"
                                  onClick={() => toggleActionMenu(item._id)}
                                >
                                  <MoreVertical size={18} />
                                </button>
                                {openActionMenuId === item._id && (
                                  <div className="dropdown-menu show position-absolute end-0">
                                    <button
                                      className="dropdown-item d-flex align-items-center"
                                      onClick={() => handleEdit(item)}
                                    >
                                      <Edit size={16} className="me-2" />
                                      Edit
                                    </button>
                                    <button
                                      className={`dropdown-item d-flex align-items-center ${item.isActive ? 'text-success' : 'text-danger'}`}
                                      onClick={() => handleActive(item)}
                                    >
                                      {item.isActive ? (
                                        <>
                                          <Check size={16} className="me-2" />
                                          Active
                                        </>
                                      ) : (
                                        <>
                                          <X size={16} className="me-2" />
                                          Inactive
                                        </>
                                      )}
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button
                                      className="dropdown-item d-flex align-items-center text-danger"
                                      onClick={() => handleDelete(item)}
                                    >
                                      <Trash size={16} className="me-2" />
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
                  <div className="d-flex justify-content-center mt-4">
                    <BasicPagination
                      page={page}
                      count={pageCount}
                      onChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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