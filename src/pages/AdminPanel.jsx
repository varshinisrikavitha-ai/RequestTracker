import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Users, Building2, Layers } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import {
  getUsers, createUser, updateUser, deleteUser,
  getDepartments, createDepartment, deleteDepartment,
  getCategories, createCategory, deleteCategory,
} from '../api/admin.api';
import { formatRole, getErrorMessage } from '../utils/formatters';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  // --- Users ---
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STAFF', departmentId: '' });

  // --- Departments ---
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  // --- Categories ---
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', departmentId: '' });

  const fetchAll = useCallback(async () => {
    try {
      const [uRes, dRes, cRes] = await Promise.all([
        getUsers({ limit: 100 }),
        getDepartments({ limit: 100 }),
        getCategories({ limit: 100 }),
      ]);
      setUsers(uRes.data.data || []);
      setDepartments(dRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openAdd = () => {
    setEditItem(null);
    setModalError('');
    if (activeTab === 'users') setNewUser({ name: '', email: '', password: '', role: 'STAFF', departmentId: '' });
    if (activeTab === 'departments') setNewDept({ name: '', description: '' });
    if (activeTab === 'categories') setNewCategory({ name: '', departmentId: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setModalError('');
    try {
      if (activeTab === 'users') {
        if (editItem) await updateUser(editItem.id, { name: newUser.name, role: newUser.role, departmentId: newUser.departmentId });
        else await createUser(newUser);
      } else if (activeTab === 'departments') {
        if (editItem) await updateUser(editItem.id, newDept); // reuse generic pattern
        else await createDepartment(newDept);
      } else if (activeTab === 'categories') {
        if (!editItem) await createCategory(newCategory);
      }
      await fetchAll();
      setShowModal(false);
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await deleteUser(id); await fetchAll(); } catch { /* ignore */ }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { await deleteDepartment(id); await fetchAll(); } catch { /* ignore */ }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await deleteCategory(id); await fetchAll(); } catch { /* ignore */ }
  };

  const tabs = [
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'departments', label: 'Manage Departments', icon: Building2 },
    { id: 'categories', label: 'Manage Categories', icon: Layers },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage users, departments, and categories</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon size={18} className="inline mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Users ({users.length})</h2>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              <Plus size={18} /> Add User
            </button>
          </div>
          <Card>
            <Table
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role', render: (row) => formatRole(row.role) },
                { key: 'department', label: 'Department', render: (row) => row.department?.name || '—' },
              ]}
              data={users}
              actions={(user) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditItem(user); setNewUser({ name: user.name, email: user.email, password: '', role: user.role, departmentId: user.departmentId || '' }); setModalError(''); setShowModal(true); }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-700">
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
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              <Plus size={18} /> Add Department
            </button>
          </div>
          <Card>
            <Table
              columns={[
                { key: 'name', label: 'Department Name' },
                { key: 'description', label: 'Description', render: (row) => row.description || '—' },
                { key: '_count', label: 'Members', render: (row) => row._count?.members ?? 0 },
              ]}
              data={departments}
              actions={(dept) => (
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteDept(dept.id)} className="text-red-600 hover:text-red-700">
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
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              <Plus size={18} /> Add Category
            </button>
          </div>
          <Card>
            <Table
              columns={[
                { key: 'name', label: 'Category Name' },
                { key: 'department', label: 'Department', render: (row) => row.department?.name || '—' },
                { key: '_count', label: 'Requests', render: (row) => row._count?.requests ?? 0 },
              ]}
              data={categories}
              actions={(cat) => (
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            />
          </Card>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        title={`${editItem ? 'Edit' : 'Add'} ${activeTab === 'users' ? 'User' : activeTab === 'departments' ? 'Department' : 'Category'}`}
        onClose={() => setShowModal(false)}
        onSubmit={handleSave}
        submitText={saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add'}
      >
        {modalError && <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{modalError}</p>}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <FormInput label="Name" placeholder="John Doe" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
            <FormInput label="Email" type="email" placeholder="john@company.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required={!editItem} disabled={!!editItem} />
            {!editItem && <FormInput label="Password" type="password" placeholder="Min 8 chars" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200">
                <option value="STAFF">Staff</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={newUser.departmentId} onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">— None —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="space-y-4">
            <FormInput label="Department Name" placeholder="Engineering" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} required />
            <FormInput label="Description" placeholder="Optional description" value={newDept.description} onChange={(e) => setNewDept({ ...newDept, description: e.target.value })} />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <FormInput label="Category Name" placeholder="Hardware" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={newCategory.departmentId} onChange={(e) => setNewCategory({ ...newCategory, departmentId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" required>
                <option value="">— Select Department —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPanel;
