import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Users, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
  last_login: string;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await api.getAllUsers();
        setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users data",
          variant: "destructive"
        });
        setUsers(getDemoUsers());
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const getDemoUsers = (): User[] => [
    {
      user_id: 1,
      email: 'student@university.edu',
      first_name: 'Alex',
      last_name: 'Johnson',
      role: 'student',
      status: 'active',
      created_at: '2024-01-15',
      last_login: '2025-01-20'
    },
    {
      user_id: 2,
      email: 'professor@university.edu',
      first_name: 'Sarah',
      last_name: 'Chen',
      role: 'faculty',
      status: 'active',
      created_at: '2023-08-20',
      last_login: '2025-01-20'
    },
    {
      user_id: 3,
      email: 'admin@university.edu',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      status: 'active',
      created_at: '2023-01-10',
      last_login: '2025-01-20'
    },
    {
      user_id: 4,
      email: 'finance@university.edu',
      first_name: 'Finance',
      last_name: 'Officer',
      role: 'finance',
      status: 'active',
      created_at: '2023-03-15',
      last_login: '2025-01-20'
    },
    {
      user_id: 5,
      email: 'parent@university.edu',
      first_name: 'Michael',
      last_name: 'Davis',
      role: 'parent',
      status: 'active',
      created_at: '2024-02-01',
      last_login: '2025-01-19'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400';
      case 'faculty': return 'bg-blue-500/20 text-blue-400';
      case 'student': return 'bg-green-500/20 text-green-400';
      case 'finance': return 'bg-purple-500/20 text-purple-400';
      case 'parent': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-500/20 text-green-400' 
      : 'bg-red-500/20 text-red-400';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Manage system users and permissions</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">System Users</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">User</TableHead>
                <TableHead className="text-white">Role</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead className="text-white">Last Login</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id} className="border-gray-700">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{user.first_name} {user.last_name}</p>
                      <p className="text-sm text-gray-400 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.last_login).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-400 border-red-400/20 hover:bg-red-400/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;