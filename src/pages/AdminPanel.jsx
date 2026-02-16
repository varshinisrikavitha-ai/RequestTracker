import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Building2, Layers } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { mockUsers, mockDepartments, mockCategories } from '../data/mockData';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);

  // Users Management
  const [users, setUsers] = useState(mockUsers);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User', department: '' });

  // Departments Management
  const [departments, setDepartments] = useState(mockDepartments);
  const [newDept, setNewDept] = useState({ name: '', manager: '' });

  // Categories Management
  const [categories, setCategories] = useState(mockCategories);
  const [newCategory, setNewCategory] = useState({ name: '' });

  // User Management
  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: users.length + 1, ...newUser }]);
      setNewUser({ name: '', email: '', role: 'User', department: '' });
      setShowModal(false);
    }
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  // Department Management
  const handleAddDept = () => {
    if (newDept.name) {
      setDepartments([...departments, { id: departments.length + 1, ...newDept }]);
      setNewDept({ name: '', manager: '' });
      setShowModal(false);
    }
  };

  const handleDeleteDept = (id) => {
    setDepartments(departments.filter((d) => d.id !== id));
  };

  // Category Management
  const handleAddCategory = () => {
    if (newCategory.name) {
      setCategories([...categories, { id: categories.length + 1, name: newCategory.name, count: 0 }]);
      setNewCategory({ name: '' });
      setShowModal(false);
    }
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage users, departments, and categories</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={18} className="inline mr-2" />
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 size={18} className="inline mr-2" />
          Manage Departments
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers size={18} className="inline mr-2" />
          Manage Categories
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Users ({users.length})</h2>
            <button
              onClick={() => {
                setModalType('add');
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={18} />
              Add User
            </button>
          </div>

          <Card>
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'department', label: 'Department' },
              ]}
              data={users}
              actions={(user) => (
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            />
          </Card>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Departments ({departments.length})</h2>
            <button
              onClick={() => {
                setModalType('add');
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={18} />
              Add Department
            </button>
          </div>

          <Card>
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Department Name' },
                { key: 'manager', label: 'Manager' },
              ]}
              data={departments}
              actions={(dept) => (
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteDept(dept.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            />
          </Card>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Categories ({categories.length})</h2>
            <button
              onClick={() => {
                setModalType('add');
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>

          <Card>
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Category Name' },
                { key: 'count', label: 'Request Count' },
              ]}
              data={categories}
              actions={(category) => (
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            />
          </Card>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showModal}
        title={`Add ${activeTab === 'users' ? 'User' : activeTab === 'departments' ? 'Department' : 'Category'}`}
        onClose={() => setShowModal(false)}
        onSubmit={
          activeTab === 'users'
            ? handleAddUser
            : activeTab === 'departments'
            ? handleAddDept
            : handleAddCategory
        }
        submitText="Add"
      >
        {activeTab === 'users' && (
          <div className="space-y-4">
            <FormInput
              label="Name"
              placeholder="John Doe"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <FormInput
              label="Email"
              type="email"
              placeholder="john@company.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="User">User</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <FormInput
              label="Department"
              placeholder="Engineering"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
            />
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="space-y-4">
            <FormInput
              label="Department Name"
              placeholder="Engineering"
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
            />
            <FormInput
              label="Manager"
              placeholder="Jane Doe"
              value={newDept.manager}
              onChange={(e) => setNewDept({ ...newDept, manager: e.target.value })}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <FormInput
              label="Category Name"
              placeholder="Hardware"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ name: e.target.value })}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPanel;
