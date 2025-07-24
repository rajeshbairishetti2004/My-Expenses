import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const CategoryModal = ({ onClose, onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3b82f6' });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/categories', newCategory);
      setNewCategory({ name: '', color: '#3b82f6' });
      fetchCategories();
      onUpdate();
    } catch (error) {
      console.error('Error adding category:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const handleEditCategory = async (categoryId, updatedData) => {
    try {
      await api.put(`/api/categories/${categoryId}`, updatedData);
      setEditingCategory(null);
      fetchCategories();
      onUpdate();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/api/categories/${categoryId}`);
        fetchCategories();
        onUpdate();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Manage Expense Categories</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="categories-list">
          {categories.map(category => (
            <CategoryItem
              key={category._id}
              category={category}
              isEditing={editingCategory === category._id}
              onEdit={() => setEditingCategory(category._id)}
              onSave={(updatedData) => handleEditCategory(category._id, updatedData)}
              onCancel={() => setEditingCategory(null)}
              onDelete={() => handleDeleteCategory(category._id)}
            />
          ))}
        </div>

        <form className="add-category-form" onSubmit={handleAddCategory}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            />
            <button type="submit" className="btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryItem = ({ category, isEditing, onEdit, onSave, onCancel, onDelete }) => {
  const [editData, setEditData] = useState({ name: category.name, color: category.color });

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="category-item editing">
        <div className="category-edit-form">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
          <input
            type="color"
            value={editData.color}
            onChange={(e) => setEditData({ ...editData, color: e.target.value })}
          />
          <button onClick={handleSave} className="btn-success">
            <i className="fas fa-check"></i>
          </button>
          <button onClick={onCancel} className="btn-secondary">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-item">
      <div className="category-display">
        <span 
          className="category-color-indicator" 
          style={{ backgroundColor: category.color }}
        ></span>
        <span className="category-name">{category.name}</span>
      </div>
      <div className="category-actions">
        <button onClick={onEdit} className="btn-secondary">
          <i className="fas fa-edit"></i>
        </button>
        <button onClick={onDelete} className="btn-danger">
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default CategoryModal;