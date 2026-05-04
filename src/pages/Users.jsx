import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Users as UsersIcon, Plus, UserCheck, UserX, Shield, MoreVertical, Search, Mail } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Users = () => {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700';
      case 'LOCKED': return 'bg-rose-100 text-rose-700';
      case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  const filteredUsers = users.filter(u => {
    // Search filter
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Self-visibility filter: Hide own account
    if (u.id === user?.id) {
      return false;
    }

    // Role visibility filter: Admins cannot see Super Admins
    if (isAdmin && !isSuperAdmin && u.role === 'SUPER_ADMIN') {
      return false;
    }
    
    return matchesSearch;
  });

  const handleStatusChange = async (userId, newStatus) => {
    const userToMod = users.find(u => u.id === userId);
    if (userToMod?.role === 'SUPER_ADMIN' && !isSuperAdmin) {
      alert('Only Super Administrators can modify other Super Administrators.');
      return;
    }
    try {
      await api.put(`/users/${userId}`, { status: newStatus });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to change status:', error);
    }
    setOpenMenuId(null);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (user?.id === userId) {
      alert('You cannot change your own role.');
      return;
    }
    const userToMod = users.find(u => u.id === userId);
    if (userToMod?.role === 'SUPER_ADMIN' && !isSuperAdmin) {
      alert('Only Super Administrators can modify other Super Administrators.');
      return;
    }
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to change role:', error);
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (userId) => {
    if (user?.id === userId) {
      alert('You cannot delete your own account.');
      return;
    }
    const userToMod = users.find(u => u.id === userId);
    if (userToMod?.role === 'SUPER_ADMIN' && !isSuperAdmin) {
      alert('Only Super Administrators can delete other Super Administrators.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        await fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
      setOpenMenuId(null);
    }
  };

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'USER', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/users', newUser);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', role: 'USER', password: '' });
      await fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const visibleUsersForCounts = users.filter(u => {
    if (u.id === user?.id) return false;
    if (isAdmin && !isSuperAdmin && u.role === 'SUPER_ADMIN') return false;
    return true;
  });

  const activeCount = visibleUsersForCounts.filter(u => u.status === 'ACTIVE').length;
  const pendingCount = visibleUsersForCounts.filter(u => u.status === 'PENDING_APPROVAL' || u.status === 'PENDING').length;
  const lockedCount = visibleUsersForCounts.filter(u => u.status === 'LOCKED').length;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>User Management | AgroGrow</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">User Management</h1>
          <p className="text-xs text-stone-500">Manage accounts, roles, and access permissions.</p>
        </div>
        {(isSuperAdmin || isAdmin) && (
          <button 
            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Account
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-emerald-50 border-emerald-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-900">{activeCount}</p>
            <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-tighter">Active Accounts</p>
          </div>
        </div>
        <div className="card bg-amber-50 border-amber-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-amber-900">{pendingCount}</p>
            <p className="text-[10px] uppercase font-bold text-amber-600 tracking-tighter">Pending Approval</p>
          </div>
        </div>
        <div className="card bg-rose-50 border-rose-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-rose-900">{lockedCount}</p>
            <p className="text-[10px] uppercase font-bold text-rose-600 tracking-tighter">Locked Accounts</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="input-field pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Table 
          headers={['User', 'Role', 'Status', 'Last Activity', 'Actions']}
          data={filteredUsers}
          className="!overflow-visible"
          renderRow={(item) => (
            <>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-bold text-stone-800 text-xs">{item.name}</span>
                  <span className="text-[10px] text-stone-400">{item.email}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 font-bold text-stone-600">
                  <Shield className="w-3 h-3" />
                  <span>{item.role.replace('_', ' ')}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight ${getStatusColor(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-stone-400 font-medium">
                {item.last_login ? new Date(item.last_login).toLocaleString() : 'Never'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 relative">
                  {item.status === 'LOCKED' && (
                    <button 
                      onClick={() => handleStatusChange(item.id, 'ACTIVE')}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Unlock
                    </button>
                  )}
                  {item.status === 'PENDING_APPROVAL' && (
                    <button 
                      onClick={() => handleStatusChange(item.id, 'ACTIVE')}
                      className="text-xs font-bold text-primary-600 hover:underline"
                    >
                      Approve
                    </button>
                  )}
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className={`p-1.5 rounded-lg transition-all ${openMenuId === item.id ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:bg-stone-50'}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === item.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 w-48 bg-white border border-stone-100 rounded-2xl shadow-xl shadow-stone-200/50 z-20 py-2"
                          >
                            <p className="px-4 py-2 text-[9px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-50 mb-1">Actions</p>
                            
                            {item.role === 'USER' ? (
                              isSuperAdmin && (
                                <button 
                                  onClick={() => handleRoleChange(item.id, 'ADMIN')}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                                >
                                  <Shield className="w-3.5 h-3.5 text-primary-500" />
                                  Make Admin
                                </button>
                              )
                            ) : (
                              item.role !== 'SUPER_ADMIN' && isSuperAdmin && (
                                <button 
                                  onClick={() => handleRoleChange(item.id, 'USER')}
                                  className="w-full px-4 py-2 text-left text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                                >
                                  <Shield className="w-3.5 h-3.5 text-stone-400" />
                                  Remove Admin
                                </button>
                              )
                            )}

                            {item.status === 'ACTIVE' ? (
                              <button 
                                onClick={() => handleStatusChange(item.id, 'LOCKED')}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                Lock Account
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleStatusChange(item.id, 'ACTIVE')}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Activate Account
                              </button>
                            )}

                            {item.role !== 'SUPER_ADMIN' && (
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-stone-50 mt-1 pt-3"
                              >
                                Delete User
                              </button>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </td>
            </>
          )}
        />
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map((item) => (
          <div key={item.id} className="card p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xs border border-stone-200 uppercase">
                  {(item.name || item.email || 'U').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{item.name || 'User'}</h4>
                  <p className="text-[10px] text-stone-400 font-medium">{item.email}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  className={`p-2 rounded-xl transition-all ${openMenuId === item.id ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:bg-stone-50'}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {openMenuId === item.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setOpenMenuId(null)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-44 bg-white border border-stone-100 rounded-2xl shadow-xl shadow-stone-200/50 z-20 py-2"
                      >
                        {item.role === 'USER' ? (
                          isSuperAdmin && (
                            <button 
                              onClick={() => handleRoleChange(item.id, 'ADMIN')}
                              className="w-full px-4 py-2 text-left text-[11px] font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                            >
                              <Shield className="w-3.5 h-3.5 text-primary-500" />
                              Make Admin
                            </button>
                          )
                        ) : (
                          item.role !== 'SUPER_ADMIN' && isSuperAdmin && (
                            <button 
                              onClick={() => handleRoleChange(item.id, 'USER')}
                              className="w-full px-4 py-2 text-left text-[11px] font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                            >
                              <Shield className="w-3.5 h-3.5 text-stone-400" />
                              Remove Admin
                            </button>
                          )
                        )}

                        {item.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => handleStatusChange(item.id, 'LOCKED')}
                            className="w-full px-4 py-2 text-left text-[11px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Lock Account
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusChange(item.id, 'ACTIVE')}
                            className="w-full px-4 py-2 text-left text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Activate Account
                          </button>
                        )}

                        {item.role !== 'SUPER_ADMIN' && (
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-full px-4 py-2 text-left text-[11px] font-bold text-rose-700 hover:bg-rose-50 border-t border-stone-50 mt-1 pt-2"
                          >
                            Delete User
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5 font-sans">Role</p>
                <div className="flex items-center gap-1.5 font-black text-stone-700 text-[10px] font-sans">
                  <Shield className="w-3 h-3 text-primary-500" />
                  {item.role.replace('_', ' ')}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5 font-sans">Status</p>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase ${getStatusColor(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="text-[10px] font-bold text-stone-400 font-sans">
                Joined Date: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'LOCKED' && (
                  <button className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-tight active:scale-95 transition-all">Unlock User</button>
                )}
                {item.status === 'PENDING_APPROVAL' && (
                  <button className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-lg uppercase tracking-tight active:scale-95 transition-all">Approve User</button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 card bg-stone-50 border-dashed border-2 border-stone-200">
            <UsersIcon className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-xs text-stone-400 font-medium italic">No matching user accounts found.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Account"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-md">Cancel</button>
            <button 
              onClick={handleCreateUser} 
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-[10px] text-stone-500 leading-relaxed italic mb-4">
            {isSuperAdmin ? "As a Super Admin, you can create and manage any account type." : "Administrators can create Agent accounts."}
          </p>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Angela Martin" 
              value={newUser.name || ''}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Work Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="amartin@agrogrow.com" 
              value={newUser.email || ''}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Initial Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Min 6 characters" 
              value={newUser.password || ''}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Initial Role</label>
            <select 
              className="input-field"
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="USER">User (Standard Account)</option>
              {isSuperAdmin && <option value="ADMIN">Administrator</option>}
              {isSuperAdmin && <option value="SUPER_ADMIN">Super Administrator</option>}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
