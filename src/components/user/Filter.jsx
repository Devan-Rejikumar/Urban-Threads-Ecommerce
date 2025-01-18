import React, { useState } from 'react'
import './Filter.css'

export default function FilterComponent() {
  const [filter, setFilter] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const categories = ['Jeans', 'Hoodies', 'Backpacks', 'Oversized T-Shirts', 'Jackets', 'Shirts']

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(filter.toLowerCase())
  )

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="filter-container">
      <input
        type="text"
        placeholder="Filter categories..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="filter-input"
      />
      <div className="categories">
        <h3>Categories</h3>
        <ul>
          {filteredCategories.map((category, index) => (
            <li key={index}>
              <label className="category-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="category-checkbox"
                />
                <span className="category-name">{category}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

