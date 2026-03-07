import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  BarChart2,
  PieChart as PieChartIcon,
  RefreshCw,
  Save,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Circle,
  LogOut,
  Lock,
  User,
  Shield,
  Key,
  Briefcase,
  Menu,
  Bell
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

// --- DANH SÁCH NHÓM PHÒNG BAN DỰ PHÒNG ---
const INITIAL_GROUPS = ['Nhóm IT', 'Nhóm Kinh Doanh', 'Nhóm Kế Toán', 'Nhóm Hành Chính', 'Nhóm Nhân Sự', 'Khác'];

// --- MOCK DATA TẠO SẴN DỰ PHÒNG ---
const INITIAL_TASKS = [
  {
    id: '1',
    phanLoai: 'Dự án trọng điểm',
    noiDung: 'Triển khai phần mềm CRM',
    chiTiet: 'Phối hợp đối tác để cài đặt và training phần mềm CRM cho phòng Kinh doanh',
    phoiHop: 'Phòng IT, Kinh doanh',
    thoiHan: '2026-03-25',
    tienDo: 'Đang thực hiện',
    tyLe: 65,
    nguoiPhuTrach: 'Nguyễn Văn A, Trần Thị B',
    baoCao: 'Đã hoàn thành cài đặt server, đang chuẩn bị training.',
    nhom: 'Nhóm IT'
  },
  {
    id: '2',
    phanLoai: 'Thường xuyên',
    noiDung: 'Báo cáo tài chính Quý 1',
    chiTiet: 'Tổng hợp số liệu thu chi Quý 1 năm 2026',
    phoiHop: 'Các phòng ban',
    thoiHan: '2026-04-10',
    tienDo: 'Chưa bắt đầu',
    tyLe: 0,
    nguoiPhuTrach: 'Trần Thị B',
    baoCao: '',
    nhom: 'Nhóm Kế Toán'
  },
  {
    id: '3',
    phanLoai: 'Đột xuất',
    noiDung: 'Tổ chức sự kiện 8/3',
    chiTiet: 'Lên kế hoạch và tổ chức sự kiện chào mừng ngày Quốc tế Phụ nữ',
    phoiHop: 'Công đoàn, Hành chính',
    thoiHan: '2026-03-08',
    tienDo: 'Hoàn thành',
    tyLe: 100,
    nguoiPhuTrach: 'Lê Văn C, Nguyễn Văn A',
    baoCao: 'Sự kiện diễn ra thành công tốt đẹp.',
    nhom: 'Nhóm Hành Chính'
  }
];

// --- TÀI KHOẢN ADMIN ẨN (Không lưu trên Sheet) ---
const SUPER_ADMIN = { 
  id: 'admin_core', 
  username: 'Admin', 
  password: '0912411451', 
  role: 'Admin', 
  fullName: 'Quản trị viên Hệ thống', 
  nhom: 'Tất cả' 
};

const DEFAULT_USERS = [];

const STATUS_COLORS = {
  'Chưa bắt đầu': '#94a3b8', 
  'Đang thực hiện': '#3b82f6', 
  'Hoàn thành': '#22c55e', 
  'Quá hạn': '#ef4444' 
};

const CATEGORY_COLORS = {
  'Thường xuyên': 'bg-blue-50 text-blue-700 border-blue-200',
  'Công việc phát sinh': 'bg-purple-50 text-purple-700 border-purple-200',
  'Đột xuất': 'bg-amber-50 text-amber-700 border-amber-200',
  'Dự án trọng điểm': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'KPI Tổng Công ty': 'bg-rose-50 text-rose-700 border-rose-200',
  'Nhiệm vụ CĐS 2026': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Quản lý phần mềm': 'bg-teal-50 text-teal-700 border-teal-200',
  'Quản lý phần cứng': 'bg-orange-50 text-orange-700 border-orange-200',
  'Các công việc khác': 'bg-slate-50 text-slate-700 border-slate-200'
};

// --- CỐ ĐỊNH ICON ỨNG DỤNG TỪ GITHUB CỦA BẠN ---
const APP_ICON_URL = 'https://raw.githubusercontent.com/superhoang9999/Icon/main/lich.png';
const FALLBACK_ICON = 'https://cdn-icons-png.flaticon.com/512/906/906324.png';

const getStatusIcon = (status) => {
  switch(status) {
    case 'Hoàn thành': return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
    case 'Đang thực hiện': return <Clock className="w-3.5 h-3.5 mr-1" />;
    case 'Quá hạn': return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
    case 'Chưa bắt đầu': default: return <Circle className="w-3.5 h-3.5 mr-1" />;
  }
};

export default function App() {
  // --- STATES XÁC THỰC & NGƯỜI DÙNG ---
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState(DEFAULT_USERS);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // --- STATES NHÓM PHÒNG BAN ---
  const [groupsList, setGroupsList] = useState(INITIAL_GROUPS);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupFormName, setGroupFormName] = useState('');

  // --- STATES GIAO DIỆN & DỮ LIỆU ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Trạng thái Menu Mobile
  
  // States Form Công việc
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [formData, setFormData] = useState({
    phanLoai: 'Thường xuyên', noiDung: '', chiTiet: '', phoiHop: '', nhom: 'Nhóm IT',
    thoiHan: '', tienDo: 'Chưa bắt đầu', tyLe: 0, nguoiPhuTrach: '', baoCao: ''
  });

  // States Form Người dùng
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: '', password: '', role: 'Thành viên', fullName: '', nhom: 'Khác'
  });

  // State Chế độ xem (Cá nhân / Nhóm)
  const [viewMode, setViewMode] = useState('personal'); 

  // Google Sheets & Cài đặt App
  const [sheetUrl, setSheetUrl] = useState('https://script.google.com/macros/s/AKfycbyWQbg_Rq8lSTUdEHZNB0rCSNE_0iR87hrmFVztnqeSfQlWzUzJOv14RRUq39do2sOdNw/exec');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Ref để lưu trữ danh sách ID công việc cũ (Dùng để so sánh tìm ra việc mới)
  const prevTaskIdsRef = useRef(new Set());
  
  // Ref để lấy user hiện tại chuẩn xác nhất trong các hàm chạy ngầm
  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // --- STATE DIALOG TÙY CHỈNH ---
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });
  const customAlert = (message) => setDialog({ isOpen: true, type: 'alert', message, onConfirm: null });
  const customConfirm = (message, onConfirm) => setDialog({ isOpen: true, type: 'confirm', message, onConfirm });
  const closeDialog = () => setDialog({ ...dialog, isOpen: false });

  // --- THIẾT LẬP WEB APP (PWA) & ICON ---
  useEffect(() => {
    // Thêm các thẻ Meta để biến trang web thành Web App khi lưu ra màn hình chính điện thoại
    const addMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    // Ép trình duyệt nhận diện và tối ưu kích thước 100% cho Mobile
    addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    
    addMetaTag("theme-color", "#2563eb");
    addMetaTag("apple-mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
    addMetaTag("apple-mobile-web-app-title", "QL Công Việc");

    // Cập nhật Favicon và Apple Touch Icon (Icon cài đặt app)
    const updateIcon = (rel, size) => {
      let link = document.querySelector(`link[rel='${rel}']`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (size) link.sizes = size;
        document.head.appendChild(link);
      }
      link.href = APP_ICON_URL;
    };
    
    updateIcon('icon', null);
    updateIcon('apple-touch-icon', '192x192');

    document.title = "Quản lý công việc";
  }, []);

  // --- AUTO ĐỒNG BỘ ĐÃ TỐI ƯU CHO 100 USER ---
  useEffect(() => {
    handleSync(true); 
    const interval = setInterval(() => handleSync(true), 60000); 

    const handleVisibilityChange = () => {
      if (document.hidden) clearInterval(interval);
      else handleSync(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sheetUrl]);

  // --- QUYỀN TRUY CẬP (RBAC) ---
  const isMember = currentUser?.role === 'Thành viên';
  const isAdmin = currentUser?.role === 'Admin';
  const canDeleteTask = currentUser?.role === 'Admin' || currentUser?.role === 'Trưởng nhóm';
  const canCreateTask = currentUser?.role === 'Admin' || currentUser?.role === 'Trưởng nhóm';

  // --- BỘ LỌC THEO NHÓM VÀ CÁ NHÂN ---
  const visibleTasks = useMemo(() => {
    if (!currentUser) return [];
    let scopeTasks = isAdmin ? tasks : tasks.filter(t => t.nhom === currentUser.nhom);
    
    if (viewMode === 'personal') {
      return scopeTasks.filter(t => {
        if (!t.nguoiPhuTrach) return false;
        const assignees = t.nguoiPhuTrach.split(',').map(s => s.trim().toLowerCase());
        const userFull = currentUser.fullName.toLowerCase();
        const userShort = currentUser.username.toLowerCase();
        return assignees.includes(userFull) || assignees.includes(userShort);
      });
    }
    return scopeTasks;
  }, [tasks, currentUser, isAdmin, viewMode]);

  // --- XỬ LÝ QUYỀN THÔNG BÁO ---
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      customAlert("Trình duyệt hoặc điện thoại của bạn không hỗ trợ thông báo đẩy.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Cài đặt thành công!", { 
        body: "Bạn sẽ nhận được thông báo khi có công việc mới.",
        icon: APP_ICON_URL
      });
    } else {
      customAlert("Bạn đã từ chối cấp quyền thông báo.");
    }
  };

  // --- XỬ LÝ ĐĂNG NHẬP ---
  const handleLogin = (e) => {
    e.preventDefault();
    const inputUsername = loginForm.username.toLowerCase();
    
    if (inputUsername === SUPER_ADMIN.username.toLowerCase() && loginForm.password === SUPER_ADMIN.password) {
      setCurrentUser(SUPER_ADMIN);
      setLoginError('');
      return;
    }

    const user = usersList.find(u => u.username.toLowerCase() === inputUsername && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
    } else {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    customConfirm("Bạn có chắc chắn muốn đăng xuất?", () => {
      setCurrentUser(null);
      setLoginForm({ username: '', password: '' });
      setActiveTab('dashboard');
      setIsMobileMenuOpen(false);
    });
  };

  // Chuyển tab trên mobile thì tự đóng menu
  const changeTab = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // --- THỐNG KÊ ---
  const stats = useMemo(() => {
    let total = visibleTasks.length, completed = 0, inProgress = 0, overdue = 0, notStarted = 0, totalRate = 0;
    visibleTasks.forEach(t => {
      totalRate += Number(t.tyLe);
      if (t.tienDo === 'Hoàn thành') completed++;
      else if (t.tienDo === 'Đang thực hiện') inProgress++;
      else if (t.tienDo === 'Quá hạn') overdue++;
      else notStarted++;
    });
    return { total, completed, inProgress, overdue, notStarted, avgRate: total === 0 ? 0 : Math.round(totalRate / total) };
  }, [visibleTasks]);

  const pieChartData = [
    { name: 'Hoàn thành', value: stats.completed },
    { name: 'Đang thực hiện', value: stats.inProgress },
    { name: 'Chưa bắt đầu', value: stats.notStarted },
    { name: 'Quá hạn', value: stats.overdue },
  ].filter(item => item.value > 0);

  const barChartData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({ name: `Tháng ${i + 1}`, 'Hoàn thành': 0, 'Chưa xong': 0 }));
    visibleTasks.forEach(t => {
      if (!t.thoiHan) return;
      const thoiHanStr = String(t.thoiHan).trim().toLowerCase();
      const statusKey = t.tienDo === 'Hoàn thành' ? 'Hoàn thành' : 'Chưa xong';

      if (thoiHanStr === 'hàng ngày') {
        for (let i = 0; i < 12; i++) data[i][statusKey]++;
      } else if (thoiHanStr === 'hàng quý') {
        [2, 5, 8, 11].forEach(i => data[i][statusKey]++); 
      } else {
        const date = new Date(t.thoiHan);
        if (!isNaN(date.getTime()) && date.getFullYear() === filterYear) {
          const monthIndex = date.getMonth();
          data[monthIndex][statusKey]++;
        }
      }
    });
    return data;
  }, [visibleTasks, filterYear]);

  const personStats = useMemo(() => {
    const statsMap = {};
    visibleTasks.forEach(t => {
      const assignees = t.nguoiPhuTrach ? t.nguoiPhuTrach.split(',').map(s => s.trim()).filter(Boolean) : ['Chưa phân công'];
      assignees.forEach(person => {
        if (!statsMap[person]) statsMap[person] = { name: person, total: 0, completed: 0, inProgress: 0, overdue: 0, notStarted: 0, totalRate: 0 };
        statsMap[person].total += 1;
        statsMap[person].totalRate += Number(t.tyLe);
        if (t.tienDo === 'Hoàn thành') statsMap[person].completed += 1;
        else if (t.tienDo === 'Đang thực hiện') statsMap[person].inProgress += 1;
        else if (t.tienDo === 'Quá hạn') statsMap[person].overdue += 1;
        else statsMap[person].notStarted += 1;
      });
    });
    return Object.values(statsMap).map(p => ({ ...p, avgRate: p.total === 0 ? 0 : Math.round(p.totalRate / p.total) })).sort((a, b) => b.total - a.total);
  }, [visibleTasks]);

  const filteredTasks = useMemo(() => {
    return visibleTasks.filter(t => {
      const matchSearch = t.noiDung.toLowerCase().includes(searchTerm.toLowerCase()) || t.nguoiPhuTrach.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchDate = true;
      if (filterMonth !== 'all') {
        const targetMonth = parseInt(filterMonth);
        if (!t.thoiHan) {
          matchDate = false;
        } else {
          const thoiHanStr = String(t.thoiHan).trim().toLowerCase();
          if (thoiHanStr === 'hàng ngày') matchDate = true; 
          else if (thoiHanStr === 'hàng quý') matchDate = [3, 6, 9, 12].includes(targetMonth);
          else {
            const date = new Date(t.thoiHan);
            if (!isNaN(date.getTime())) matchDate = date.getMonth() + 1 === targetMonth && date.getFullYear() === filterYear;
            else matchDate = false;
          }
        }
      }
      return matchSearch && matchDate;
    });
  }, [visibleTasks, searchTerm, filterMonth, filterYear]);

  // --- XỬ LÝ FORM CÔNG VIỆC ---
  const handleOpenForm = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({ ...task });
    } else {
      setEditingTask(null);
      setFormData({ 
        phanLoai: 'Thường xuyên', noiDung: '', chiTiet: '', phoiHop: '', thoiHan: '', tienDo: 'Chưa bắt đầu', 
        tyLe: 0, nguoiPhuTrach: '', baoCao: '', nhom: isAdmin ? (groupsList[0] || 'Khác') : currentUser.nhom 
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    const newTask = editingTask ? { ...formData, id: editingTask.id } : { ...formData, id: Date.now().toString() };
    if (!isAdmin) newTask.nhom = currentUser.nhom;

    if (editingTask) setTasks(tasks.map(t => t.id === editingTask.id ? newTask : t));
    else setTasks([...tasks, newTask]);
    setIsFormOpen(false);

    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: editingTask ? 'update' : 'add', sheetName: 'Data', ...newTask })
        });
      } catch (error) { console.error("Lỗi khi lưu task:", error); }
    }
  };

  const handleDeleteTask = async (id) => {
    customConfirm('Bạn có chắc chắn muốn xóa công việc này?', async () => {
      setTasks(prev => prev.filter(t => t.id !== id));
      if (sheetUrl) {
        try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'delete', sheetName: 'Data', id: id }) }); } 
        catch (error) { console.error("Lỗi xóa task:", error); }
      }
    });
  };

  // --- XỬ LÝ FORM NGƯỜI DÙNG & NHÓM ---
  const handleOpenUserForm = (user = null) => {
    if (user) { setEditingUser(user); setUserFormData({ ...user }); } 
    else { setEditingUser(null); setUserFormData({ username: '', password: '', role: 'Thành viên', fullName: '', nhom: groupsList[0] || 'Khác' }); }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const userToSave = { ...userFormData };
    if (userToSave.role === 'Admin') userToSave.nhom = 'Tất cả';

    const newUser = editingUser ? { ...userToSave, id: editingUser.id } : { ...userToSave, id: 'u' + Date.now() };

    if (editingUser) {
      const isDuplicate = usersList.some(u => u.id !== newUser.id && u.username.toLowerCase() === newUser.username.toLowerCase());
      if (isDuplicate || newUser.username.toLowerCase() === SUPER_ADMIN.username.toLowerCase()) {
        customAlert("Tên tài khoản đã tồn tại!"); return;
      }
      setUsersList(usersList.map(u => u.id === editingUser.id ? newUser : u));
    } else {
      const newUsernameLower = newUser.username.toLowerCase();
      if (newUsernameLower === SUPER_ADMIN.username.toLowerCase() || usersList.some(u => u.username.toLowerCase() === newUsernameLower)) { 
        customAlert("Tên tài khoản đã tồn tại!"); return; 
      }
      setUsersList([...usersList, newUser]);
    }
    setIsUserModalOpen(false);

    if (sheetUrl) {
      try {
        await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: editingUser ? 'update' : 'add', sheetName: 'Users', ...newUser }) });
      } catch (error) { console.error("Lỗi khi lưu user:", error); }
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser.id) { customAlert("Không thể xóa tài khoản đang đăng nhập!"); return; }
    customConfirm('Bạn có chắc chắn muốn xóa tài khoản này?', async () => {
      setUsersList(prevList => prevList.filter(u => u.id !== id)); 
      if (sheetUrl) {
        try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'delete', sheetName: 'Users', id: id }) }); } 
        catch (error) { console.error("Lỗi xóa user:", error); }
      }
    });
  };

  const handleOpenGroupForm = (groupName = null) => {
    setEditingGroup(groupName);
    setGroupFormName(groupName || '');
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    const newName = groupFormName.trim();
    if (!newName) return;

    if (editingGroup) {
      if (editingGroup === newName) { setIsGroupModalOpen(false); return; }
      if (groupsList.includes(newName)) { customAlert('Tên nhóm đã tồn tại!'); return; }
      
      setGroupsList(groupsList.map(g => g === editingGroup ? newName : g));
      setTasks(tasks.map(t => t.nhom === editingGroup ? { ...t, nhom: newName } : t));
      setUsersList(usersList.map(u => u.nhom === editingGroup ? { ...u, nhom: newName } : u));
      if (currentUser?.nhom === editingGroup) setCurrentUser({...currentUser, nhom: newName});
      
      if (sheetUrl) {
        try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'updateGroup', oldName: editingGroup, newName: newName }) }); } 
        catch (error) { console.error("Lỗi cập nhật nhóm:", error); }
      }
    } else {
      if (groupsList.includes(newName)) { customAlert('Tên nhóm đã tồn tại!'); return; }
      setGroupsList([...groupsList, newName]);
      if (sheetUrl) {
        try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'add', sheetName: 'Group', name: newName }) }); } 
        catch (error) { console.error("Lỗi thêm nhóm:", error); }
      }
    }
    setIsGroupModalOpen(false);
  };

  const handleDeleteGroup = async (groupName) => {
    if (groupName === 'Khác') { customAlert('Không thể xóa nhóm mặc định này!'); return; }
    customConfirm(`Bạn có chắc muốn xóa nhóm "${groupName}"?\n\nCác công việc và nhân sự thuộc nhóm này sẽ tự động bị chuyển về nhóm "Khác".`, async () => {
      setGroupsList(prevList => prevList.filter(g => g !== groupName));
      setTasks(prevTasks => prevTasks.map(t => t.nhom === groupName ? { ...t, nhom: 'Khác' } : t));
      setUsersList(prevUsers => prevUsers.map(u => u.nhom === groupName ? { ...u, nhom: 'Khác' } : u));
      if (currentUser?.nhom === groupName) setCurrentUser({...currentUser, nhom: 'Khác'});
      
      if (sheetUrl) {
        try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'deleteGroup', name: groupName }) }); } 
        catch (error) { console.error("Lỗi xóa nhóm:", error); }
      }
    });
  };

  // --- KẾT NỐI API ---
  const handleSync = async (isSilent = false) => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    try {
      const response = await fetch(`${sheetUrl}?action=getAll`);
      const result = await response.json();
      
      if (result.status === 'success') {
        if (result.tasks) {
          const fetchedTasks = result.tasks.filter(row => row['Nội dung công việc']).map(row => {
              let parsedThoiHan = '';
              if (row['Thời hạn']) {
                const d = new Date(row['Thời hạn']);
                parsedThoiHan = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : String(row['Thời hạn']);
              }
              return {
                id: row['ID']?.toString() || Date.now().toString(),
                phanLoai: row['Phân loại nhiệm vụ'] || 'Thường xuyên',
                noiDung: row['Nội dung công việc'] || '',
                chiTiet: row['Chi tiết công việc'] || '',
                phoiHop: row['Phối hợp'] || '',
                thoiHan: parsedThoiHan,
                tienDo: row['Tiến độ'] || 'Chưa bắt đầu',
                tyLe: Number(row['Tỷ lệ hoàn thành']) || 0,
                nguoiPhuTrach: row['Người được phân công'] || '',
                baoCao: row['Báo cáo kết quả'] || '',
                nhom: row['Nhóm'] || 'Khác'
              };
            });

          if (fetchedTasks.length > 0) {
             // --- BẮT ĐẦU LOGIC THÔNG BÁO PUSH ---
             const currentUserNow = currentUserRef.current;
             // Chỉ thông báo nếu không phải lần tải trang đầu tiên và đã được cấp quyền
             if (prevTaskIdsRef.current.size > 0 && Notification.permission === "granted" && currentUserNow) {
               const newTasks = fetchedTasks.filter(t => !prevTaskIdsRef.current.has(t.id));
               
               newTasks.forEach(task => {
                 const assignees = task.nguoiPhuTrach ? task.nguoiPhuTrach.split(',').map(s => s.trim().toLowerCase()) : [];
                 const myName = currentUserNow.fullName.toLowerCase();
                 const myUsername = currentUserNow.username.toLowerCase();
                 
                 // Nếu công việc mới này có tên của mình trong danh sách phụ trách
                 if (assignees.includes(myName) || assignees.includes(myUsername)) {
                   new Notification("Bạn có công việc mới được phân công!", {
                     body: task.noiDung,
                     icon: APP_ICON_URL,
                     vibrate: [200, 100, 200] // Rung trên điện thoại nếu hỗ trợ
                   });
                 }
               });
             }
             // Cập nhật lại danh sách ID để làm mốc cho lần đồng bộ sau
             prevTaskIdsRef.current = new Set(fetchedTasks.map(t => t.id));
             // --- KẾT THÚC LOGIC THÔNG BÁO PUSH ---

             setTasks(fetchedTasks);
          }
        }

        if (result.users) {
          const fetchedUsers = result.users.filter(row => row['Tên đăng nhập']).map(row => ({
            id: row['ID']?.toString() || Date.now().toString(),
            fullName: row['Họ và tên'],
            username: row['Tên đăng nhập'],
            password: row['Mật khẩu'],
            role: row['Quyền hạn'] || 'Thành viên',
            nhom: row['Nhóm'] || 'Khác'
          }));
          setUsersList(fetchedUsers);
          if (currentUser && currentUser.id !== 'admin_core') {
            const updatedCurrent = fetchedUsers.find(u => u.id === currentUser.id);
            if (updatedCurrent) setCurrentUser(updatedCurrent);
          }
        }

        if (result.groups) {
          const fetchedGroups = result.groups.filter(row => row['Tên nhóm']).map(row => row['Tên nhóm']);
          if (fetchedGroups.length > 0) {
             const finalGroups = Array.from(new Set([...fetchedGroups, 'Khác']));
             setGroupsList(finalGroups);
          }
        }
      }
    } catch (error) { console.error("Lỗi lấy dữ liệu:", error); } 
    finally { setIsSyncing(false); }
  };

  // --- MÀN HÌNH ĐĂNG NHẬP ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4 relative">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10">
          <div className="bg-blue-600 p-8 text-center">
            {/* Đã xóa nền trắng, tăng kích thước (w-24 h-24), thêm drop-shadow */}
            <div className="w-24 h-24 mx-auto mb-4 transform hover:scale-105 transition-transform">
               <img src={APP_ICON_URL} alt="App Logo" className="w-full h-full object-contain drop-shadow-md" onError={(e)=>{e.target.onerror = null; e.target.src=FALLBACK_ICON}}/>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Quản lý công việc</h1>
            <p className="text-blue-100 text-sm">Hệ thống chuyên nghiệp nội bộ</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">{loginError}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" required
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                  placeholder="Nhập tên tài khoản..."
                  value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" required
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                  placeholder="••••••••"
                  value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md flex justify-center items-center text-lg">
              <Lock className="w-5 h-5 mr-2" /> Đăng nhập hệ thống
            </button>
          </form>
          <div className="text-center pb-6 text-xs text-gray-400 font-medium">
            Copyright &copy; Nguyễn Xuân Hoàng 2026
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH CHÍNH ỨNG DỤNG ---
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Nền Overlay cho Mobile khi mở Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Responsive: Ẩn trên mobile, trượt ra khi nhấn */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out z-30 w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl md:shadow-sm`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <img src={APP_ICON_URL} alt="Icon" className="w-8 h-8 object-contain rounded-lg shadow-sm" onError={(e)=>{e.target.onerror = null; e.target.src=FALLBACK_ICON}}/>
            <h1 className="text-lg font-bold text-gray-800 truncate">Quản lý công việc</h1>
          </div>
          {/* Info Box User */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full opacity-50 pointer-events-none"></div>
            <span className="text-sm font-bold text-blue-900">{currentUser.fullName}</span>
            <div className="flex space-x-2 mt-1.5 flex-wrap gap-y-1">
              <span className="text-[10px] font-bold text-blue-600 bg-white border border-blue-200 px-1.5 py-0.5 rounded shadow-sm">{currentUser.role}</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded shadow-sm">{currentUser.nhom}</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => changeTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-5 h-5" /><span>Tổng quan</span>
          </button>
          <button onClick={() => changeTab('tasks')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'tasks' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ListTodo className="w-5 h-5" /><span>Danh sách công việc</span>
          </button>
          
          {/* TAB QUẢN LÝ CHO ADMIN */}
          {isAdmin && (
            <>
              <button onClick={() => changeTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Users className="w-5 h-5" /><span>Quản lý người dùng</span>
              </button>
              <button onClick={() => changeTab('groups')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'groups' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Briefcase className="w-5 h-5" /><span>Danh mục Nhóm</span>
              </button>
            </>
          )}
          
          <button onClick={() => changeTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Settings className="w-5 h-5" /><span>{isAdmin ? 'Cài đặt hệ thống' : 'Cài đặt'}</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50">
          <button type="button" onClick={() => handleSync()} disabled={isSyncing} className="w-full flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
          </button>
          <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4" /><span>Đăng xuất</span>
          </button>
          <div className="pt-2 text-center text-[10px] text-gray-400 font-medium">
            Copyright &copy; Nguyễn Xuân Hoàng 2026
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center space-x-2">
             <img src={APP_ICON_URL} alt="Icon" className="w-6 h-6 object-contain" onError={(e)=>{e.target.onerror = null; e.target.src=FALLBACK_ICON}}/>
             <h1 className="text-base font-bold text-gray-800">Quản lý công việc</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 active:scale-95 transition-transform">
             <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {activeTab === 'dashboard' && (
            <div className="pb-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 gap-4">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Tổng quan</h2>
                  <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button onClick={() => setViewMode('personal')} className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors ${viewMode === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>Của tôi</button>
                    <button onClick={() => setViewMode('group')} className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors ${viewMode === 'group' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>{isAdmin ? 'Hệ thống' : 'Của Nhóm'}</button>
                  </div>
                </div>
                <div className="flex w-full md:w-auto">
                  <select className="w-full md:w-auto bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))}>
                    <option value={2025}>Năm 2025</option><option value={2026}>Năm 2026</option><option value={2027}>Năm 2027</option>
                  </select>
                </div>
              </div>

              {/* Thẻ thống kê */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-center md:justify-start text-center md:text-left">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600 mx-auto md:mx-0 mb-2 md:mb-0 md:mr-4"><ListTodo className="w-6 h-6 md:w-8 md:h-8" /></div>
                  <div><p className="text-xs md:text-sm text-gray-500 font-medium">Tổng việc</p><h3 className="text-xl md:text-2xl font-bold text-gray-800">{stats.total}</h3></div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-center md:justify-start text-center md:text-left">
                  <div className="bg-green-100 p-3 rounded-full text-green-600 mx-auto md:mx-0 mb-2 md:mb-0 md:mr-4"><CheckCircle className="w-6 h-6 md:w-8 md:h-8" /></div>
                  <div><p className="text-xs md:text-sm text-gray-500 font-medium">Hoàn thành</p><h3 className="text-xl md:text-2xl font-bold text-gray-800">{stats.completed}</h3></div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-center md:justify-start text-center md:text-left">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-500 mx-auto md:mx-0 mb-2 md:mb-0 md:mr-4"><Clock className="w-6 h-6 md:w-8 md:h-8" /></div>
                  <div><p className="text-xs md:text-sm text-gray-500 font-medium">Đang làm</p><h3 className="text-xl md:text-2xl font-bold text-gray-800">{stats.inProgress}</h3></div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-center md:justify-start text-center md:text-left">
                  <div className="bg-red-100 p-3 rounded-full text-red-600 mx-auto md:mx-0 mb-2 md:mb-0 md:mr-4"><AlertCircle className="w-6 h-6 md:w-8 md:h-8" /></div>
                  <div><p className="text-xs md:text-sm text-gray-500 font-medium">Quá hạn</p><h3 className="text-xl md:text-2xl font-bold text-gray-800">{stats.overdue}</h3></div>
                </div>
              </div>

              {/* Biểu đồ */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                  <h3 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-blue-500" /> Thống kê theo tháng</h3>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                        <Legend wrapperStyle={{paddingTop: '10px', fontSize: 12}} />
                        <Bar dataKey="Hoàn thành" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={20} />
                        <Bar dataKey="Chưa xong" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                  <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 flex items-center w-full"><PieChartIcon className="w-5 h-5 mr-2 text-blue-500" /> Tỷ lệ trạng thái</h3>
                  <div className="h-56 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieChartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                          {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-2xl font-bold text-gray-800">{stats.avgRate}%</span>
                       <span className="text-[10px] text-gray-500 uppercase tracking-wider">T.Bình HT</span>
                    </div>
                  </div>
                  <div className="w-full mt-4 space-y-2">
                    {pieChartData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs md:text-sm">
                        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full mr-2" style={{backgroundColor: STATUS_COLORS[item.name]}}></span><span className="text-gray-600">{item.name}</span></div>
                        <span className="font-semibold text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bảng hiệu suất - Cuộn ngang trên mobile */}
              <div className="mt-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-blue-500" /> Người phụ trách</h3>
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 md:px-0">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs md:text-sm font-semibold text-gray-600">
                          <th className="p-3 md:p-4 rounded-tl-lg whitespace-nowrap">Nhân sự</th>
                          <th className="p-3 md:p-4 text-center whitespace-nowrap">Tổng việc</th>
                          <th className="p-3 md:p-4 text-center text-green-600 whitespace-nowrap">Hoàn thành</th>
                          <th className="p-3 md:p-4 text-center text-blue-600 whitespace-nowrap">Đang làm</th>
                          <th className="p-3 md:p-4 text-center text-red-600 whitespace-nowrap">Quá hạn</th>
                          <th className="p-3 md:p-4 text-center rounded-tr-lg whitespace-nowrap">Tỷ lệ TB</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                        {personStats.map((person, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 md:p-4 font-medium text-gray-800 flex items-center whitespace-nowrap">
                               <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 font-bold text-[10px] md:text-xs shrink-0">{person.name.charAt(0).toUpperCase()}</div>
                               {person.name}
                            </td>
                            <td className="p-3 md:p-4 text-center font-bold text-gray-700">{person.total}</td>
                            <td className="p-3 md:p-4 text-center">{person.completed}</td><td className="p-3 md:p-4 text-center">{person.inProgress}</td><td className="p-3 md:p-4 text-center">{person.overdue}</td>
                            <td className="p-3 md:p-4 text-center"><span className={`px-2 py-1 rounded-md text-[10px] md:text-xs font-semibold ${person.avgRate >= 80 ? 'bg-green-100 text-green-700' : person.avgRate >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{person.avgRate}%</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="h-full flex flex-col pb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Công việc</h2>
                  <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button onClick={() => setViewMode('personal')} className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors ${viewMode === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>Của tôi</button>
                    <button onClick={() => setViewMode('group')} className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors ${viewMode === 'group' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>{isAdmin ? 'Hệ thống' : 'Nhóm'}</button>
                  </div>
                </div>
                {canCreateTask && (
                  <button onClick={() => handleOpenForm()} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm font-medium">
                    <Plus className="w-5 h-5 mr-1" /> Thêm công việc
                  </button>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Tìm nội dung, người làm..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                  <option value="all">Tất cả tháng</option>
                  {Array.from({length: 12}, (_, i) => (<option key={i+1} value={i+1}>Tháng {i+1}</option>))}
                </select>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs md:text-sm font-semibold text-gray-600">
                        <th className="p-4 whitespace-nowrap">Nội dung công việc</th>
                        <th className="p-4 whitespace-nowrap">Phân loại</th>
                        {isAdmin && <th className="p-4 whitespace-nowrap">Nhóm</th>}
                        <th className="p-4 whitespace-nowrap">Thời hạn</th>
                        <th className="p-4 whitespace-nowrap">Phụ trách</th>
                        <th className="p-4 whitespace-nowrap">Tiến độ</th>
                        <th className="p-4 text-center whitespace-nowrap">Tỷ lệ</th>
                        <th className="p-4 text-center whitespace-nowrap sticky right-0 bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                      {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-blue-50 transition-colors cursor-pointer group" onClick={() => setViewingTask(task)}>
                          <td className="p-4 max-w-[200px] md:max-w-xs">
                            <div className="font-bold text-gray-800 line-clamp-2" title={task.noiDung}>{task.noiDung}</div>
                            <div className="text-[11px] md:text-xs text-gray-500 line-clamp-2 mt-1" title={task.chiTiet}>{task.chiTiet}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded border whitespace-nowrap shadow-sm text-[10px] md:text-xs font-bold ${CATEGORY_COLORS[task.phanLoai] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>{task.phanLoai}</span>
                          </td>
                          {isAdmin && (
                            <td className="p-4">
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded text-[10px] md:text-xs font-bold whitespace-nowrap">{task.nhom}</span>
                            </td>
                          )}
                          <td className="p-4 text-gray-600 font-medium whitespace-nowrap">
                              {task.thoiHan ? (!isNaN(new Date(task.thoiHan).getTime()) ? new Date(task.thoiHan).toLocaleDateString('vi-VN') : task.thoiHan) : '---'}
                          </td>
                          <td className="p-4 text-gray-800 font-medium">
                            <div className="flex flex-wrap gap-1">
                              {task.nguoiPhuTrach.split(',').map((name, i) => (<span key={i} className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] md:text-xs border border-blue-100 whitespace-nowrap">{name.trim()}</span>))}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap shadow-sm" style={{ backgroundColor: `${STATUS_COLORS[task.tienDo]}15`, color: STATUS_COLORS[task.tienDo], border: `1px solid ${STATUS_COLORS[task.tienDo]}40` }}>
                              {getStatusIcon(task.tienDo)} {task.tienDo}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center min-w-[80px]">
                              <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mr-2"><div className="h-1.5 md:h-2 rounded-full" style={{ width: `${task.tyLe}%`, backgroundColor: STATUS_COLORS[task.tienDo] }}></div></div>
                              <span className="text-[10px] md:text-xs font-bold text-gray-600 w-6 text-right">{task.tyLe}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] transition-colors">
                            <div className="flex items-center justify-center space-x-1 md:space-x-2">
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenForm(task); }} className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors bg-white shadow-sm border border-gray-100" title={isMember ? "Cập nhật" : "Sửa"}>
                                <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                              {canDeleteTask && (
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteTask(task.id); }} className="p-1.5 md:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors bg-white shadow-sm border border-gray-100" title="Xóa">
                                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (<tr><td colSpan={isAdmin ? "8" : "7"} className="p-8 text-center text-gray-500">Không tìm thấy công việc nào.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB QUẢN LÝ CHO ADMIN */}
          {activeTab === 'users' && isAdmin && (
            <div className="pb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Tài khoản & Phân quyền</h2>
                <button onClick={() => handleOpenUserForm()} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm font-medium">
                  <Plus className="w-5 h-5 mr-1" /> Thêm tài khoản
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs md:text-sm font-semibold text-gray-600">
                      <th className="p-4 whitespace-nowrap">Họ và tên</th><th className="p-4 whitespace-nowrap">Tên đăng nhập</th>
                      <th className="p-4 whitespace-nowrap">Nhóm</th><th className="p-4 whitespace-nowrap">Quyền hạn</th><th className="p-4 text-center whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                    {usersList.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-800 whitespace-nowrap">{user.fullName}</td>
                        <td className="p-4 font-mono text-gray-500">{user.username}</td>
                        <td className="p-4 text-indigo-700 font-bold whitespace-nowrap">{user.nhom}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold border whitespace-nowrap ${user.role==='Admin' ? 'bg-rose-50 text-rose-700 border-rose-200' : user.role==='Trưởng nhóm' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button type="button" onClick={() => handleOpenUserForm(user)} className="p-2 bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm"><Edit className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDeleteUser(user.id)} disabled={user.id === currentUser.id} className={`p-2 bg-white border border-gray-200 rounded-lg shadow-sm ${user.id === currentUser.id ? 'text-gray-300' : 'text-red-600 hover:bg-red-50'}`}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'groups' && isAdmin && (
            <div className="pb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Danh mục Nhóm</h2>
                <button onClick={() => handleOpenGroupForm()} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm font-medium">
                  <Plus className="w-5 h-5 mr-1" /> Thêm nhóm
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs md:text-sm font-semibold text-gray-600">
                      <th className="p-4 w-16 text-center">STT</th><th className="p-4">Tên Nhóm / Phòng ban</th><th className="p-4 text-center w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                    {groupsList.map((group, idx) => (
                      <tr key={group} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="p-4 font-bold text-indigo-700">{group}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button type="button" onClick={() => handleOpenGroupForm(group)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDeleteGroup(group)} disabled={group === 'Khác'} className={`p-1.5 rounded-lg ${group === 'Khác' ? 'text-gray-300' : 'text-red-600 hover:bg-red-100'}`}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="pb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">{isAdmin ? 'Cài đặt Hệ thống' : 'Cài đặt Ứng dụng'}</h2>
              <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : 'max-w-xl'} gap-6`}>
                
                {/* Panel Icon & PWA */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Bell className="w-6 h-6"/></div>
                    <h3 className="text-lg font-bold text-gray-800">Thông báo đẩy (Push Notifications)</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Kích hoạt thông báo trên trình duyệt (hoặc thiết bị di động) để nhận các cảnh báo tức thời từ ứng dụng của bạn.
                    </p>
                    <button onClick={requestNotificationPermission} className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm font-medium text-sm">
                      <Bell className="w-5 h-5 mr-2 text-yellow-500" /> Bật cảnh báo trình duyệt
                    </button>
                  </div>
                </div>

                {/* Panel Database (Chỉ hiển thị cho Admin) */}
                {isAdmin && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Save className="w-6 h-6"/></div>
                      <h3 className="text-lg font-bold text-gray-800">Cơ sở dữ liệu Sheets</h3>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API URL (Google Apps Script)</label>
                      <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs md:text-sm text-gray-600 bg-gray-50" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
                      <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-xl text-xs md:text-sm border border-amber-200">
                        <strong>Cấu trúc bắt buộc:</strong> File Google Sheets phải chứa 3 tab mang tên chính xác: <code>Data</code>, <code>Users</code>, và <code>Group</code>.
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal Popup Chi tiết (Chỉ xem) */}
      {viewingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4 transition-opacity" onClick={() => setViewingTask(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform md:translate-y-0 translate-y-0" onClick={e => e.stopPropagation()}>
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div className="pr-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold border whitespace-nowrap shadow-sm ${CATEGORY_COLORS[viewingTask.phanLoai] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>{viewingTask.phanLoai}</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 whitespace-nowrap shadow-sm">{viewingTask.nhom}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">{viewingTask.noiDung}</h3>
              </div>
              <button onClick={() => setViewingTask(null)} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">&times;</button>
            </div>
            
            <div className="p-5 md:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 mb-1 font-medium">Người phụ trách</p>
                  <div className="font-bold text-gray-800">{viewingTask.nguoiPhuTrach ? viewingTask.nguoiPhuTrach.split(',').map((n, i) => (<span key={i} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1.5 mb-1 border border-gray-200">{n.trim()}</span>)) : '---'}</div>
                </div>
                <div><p className="text-xs md:text-sm text-gray-500 mb-1 font-medium">Phối hợp với</p><p className="font-bold text-gray-800 text-sm md:text-base">{viewingTask.phoiHop || '---'}</p></div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 mb-1 font-medium">Thời hạn</p>
                  <div className="flex items-center font-bold text-gray-800 text-sm md:text-base"><Calendar className="w-4 h-4 mr-2 text-blue-500" />{viewingTask.thoiHan ? (!isNaN(new Date(viewingTask.thoiHan).getTime()) ? new Date(viewingTask.thoiHan).toLocaleDateString('vi-VN') : viewingTask.thoiHan) : '---'}</div>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 mb-1 font-medium">Tiến độ hiện tại</p>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-sm" style={{ backgroundColor: `${STATUS_COLORS[viewingTask.tienDo]}15`, color: STATUS_COLORS[viewingTask.tienDo], border: `1px solid ${STATUS_COLORS[viewingTask.tienDo]}40` }}>{getStatusIcon(viewingTask.tienDo)}{viewingTask.tienDo}</span>
                    <span className="font-black text-gray-700 text-lg">{viewingTask.tyLe}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100"><p className="text-xs md:text-sm text-gray-500 mb-2 font-medium">Chi tiết công việc</p><div className="bg-gray-50 p-4 rounded-xl text-gray-700 whitespace-pre-wrap text-sm border border-gray-100 leading-relaxed">{viewingTask.chiTiet || 'Chưa có mô tả chi tiết.'}</div></div>
              <div className="pt-2"><p className="text-xs md:text-sm text-gray-500 mb-2 font-medium">Nhật ký xử lý / Báo cáo</p><div className="bg-blue-50 p-4 rounded-xl text-gray-800 whitespace-pre-wrap text-sm border border-blue-100 leading-relaxed font-medium">{viewingTask.baoCao || 'Chưa có cập nhật.'}</div></div>
            </div>

            <div className="p-4 md:p-5 border-t border-gray-100 bg-gray-50 rounded-b-none md:rounded-b-2xl flex justify-end space-x-3 pb-8 md:pb-5">
              <button onClick={() => { handleOpenForm(viewingTask); setViewingTask(null); }} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors flex items-center shadow-sm font-medium text-sm"><Edit className="w-4 h-4 mr-2" /> Cập nhật</button>
              <button onClick={() => setViewingTask(null)} className="px-5 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors shadow-sm font-medium text-sm">Đóng lại</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Thêm/Sửa CÔNG VIỆC */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">
                {editingTask ? (isMember ? 'Cập nhật tiến độ' : 'Sửa công việc') : 'Thêm công việc mới'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleSaveTask} className="p-5 md:p-6">
              {isMember && <div className="mb-6 bg-blue-50 text-blue-800 p-3 rounded-xl text-xs md:text-sm flex items-start border border-blue-100 shadow-sm"><Shield className="w-5 h-5 mr-2 shrink-0 text-blue-500" />Thành viên chỉ được phép cập nhật khu vực Tiến độ, Tỷ lệ và Báo cáo.</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Nội dung công việc <span className="text-red-500">*</span></label>
                  <input type="text" required disabled={isMember} value={formData.noiDung} onChange={e => setFormData({...formData, noiDung: e.target.value})} className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none text-sm ${isMember ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-blue-500 bg-white shadow-sm'}`} />
                </div>
                
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Phân loại nhiệm vụ</label>
                  <select disabled={isMember} value={formData.phanLoai} onChange={e => setFormData({...formData, phanLoai: e.target.value})} className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none text-sm font-medium ${isMember ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-blue-500 shadow-sm'}`}>
                    {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-indigo-700 mb-1.5">Giao cho Nhóm <span className="text-red-500">*</span></label>
                    <select value={formData.nhom} onChange={e => setFormData({...formData, nhom: e.target.value})} className="w-full px-4 py-2.5 border border-indigo-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-medium">
                      {groupsList.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                )}

                <div className={isAdmin ? '' : 'sm:col-span-2'}>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Người phụ trách (Tên ĐN / Họ tên)</label>
                  <input type="text" disabled={isMember} value={formData.nguoiPhuTrach} onChange={e => setFormData({...formData, nguoiPhuTrach: e.target.value})} placeholder="Ngăn cách bởi dấu phẩy" className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none text-sm ${isMember ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-blue-500 shadow-sm'}`} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Mô tả chi tiết</label>
                  <textarea rows="2" disabled={isMember} value={formData.chiTiet} onChange={e => setFormData({...formData, chiTiet: e.target.value})} className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none text-sm ${isMember ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-blue-500 shadow-sm'}`}></textarea>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Đơn vị / Người phối hợp</label>
                  <input type="text" disabled={isMember} value={formData.phoiHop} onChange={e => setFormData({...formData, phoiHop: e.target.value})} className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none text-sm ${isMember ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-blue-500 shadow-sm'}`} />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Thời hạn (Deadline)</label>
                  <input type={formData.thoiHan && isNaN(new Date(formData.thoiHan).getTime()) ? "text" : "date"} disabled={isMember} value={formData.thoiHan} onChange={e => setFormData({...formData, thoiHan: e.target.value})} className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none text-sm font-medium ${isMember ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-blue-500 shadow-sm'}`} />
                </div>

                {/* --- KHU VỰC CẬP NHẬT TIẾN ĐỘ --- */}
                <div className="bg-blue-50/70 p-4 md:p-5 rounded-2xl border border-blue-100 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 shadow-inner">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1.5">Trạng thái <span className="text-red-500">*</span></label>
                    <select value={formData.tienDo} onChange={e => { const val = e.target.value; setFormData({...formData, tienDo: val, tyLe: val === 'Hoàn thành' ? 100 : formData.tyLe}); }} className="w-full px-4 py-2.5 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm font-bold text-sm">
                      <option value="Chưa bắt đầu">Chưa bắt đầu</option><option value="Đang thực hiện">Đang thực hiện</option>
                      <option value="Hoàn thành">Hoàn thành</option><option value="Quá hạn">Quá hạn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1.5">Tỷ lệ hoàn thành: <span className="text-blue-700">{formData.tyLe}%</span></label>
                    <div className="flex items-center mt-3.5">
                      <input type="range" min="0" max="100" step="5" value={formData.tyLe} onChange={e => setFormData({...formData, tyLe: Number(e.target.value)})} className="w-full h-2.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-sm" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1.5">Báo cáo kết quả / Nhật ký xử lý</label>
                    <textarea rows="3" value={formData.baoCao} onChange={e => setFormData({...formData, baoCao: e.target.value})} className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm text-sm" placeholder="Ghi chú kết quả công việc, khó khăn vướng mắc..."></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100 pb-4 md:pb-0">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm shadow-sm bg-white">Hủy bỏ</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm">
                  {editingTask ? 'Lưu cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Thêm/Sửa TÀI KHOẢN */}
      {isUserModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4" onClick={() => setIsUserModalOpen(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-sm transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800">{editingUser ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="bg-white p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors shadow-sm">&times;</button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-5 md:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Họ và Tên</label>
                <input type="text" required value={userFormData.fullName} onChange={e => setUserFormData({...userFormData, fullName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Tên đăng nhập (Username)</label>
                <input type="text" required value={userFormData.username} disabled={editingUser !== null} onChange={e => setUserFormData({...userFormData, username: e.target.value.replace(/\s/g, '')})} className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none text-sm shadow-sm ${editingUser ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-blue-500'}`} placeholder="Viết liền không dấu" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu</label>
                <input type="text" required value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm" placeholder="Nhập mật khẩu" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Quyền hạn</label>
                <select value={userFormData.role} onChange={e => {
                    const newRole = e.target.value;
                    setUserFormData({...userFormData, role: newRole, nhom: newRole === 'Admin' ? 'Tất cả' : userFormData.nhom});
                  }} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm shadow-sm">
                  <option value="Thành viên">Thành viên</option>
                  <option value="Trưởng nhóm">Trưởng nhóm</option>
                  <option value="Admin">Admin (Quản trị)</option>
                </select>
              </div>
              {userFormData.role !== 'Admin' && (
                <div>
                  <label className="block text-xs font-bold text-indigo-700 mb-1.5">Thuộc Nhóm</label>
                  <select value={userFormData.nhom} onChange={e => setUserFormData({...userFormData, nhom: e.target.value})} className="w-full px-4 py-2.5 border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700 text-sm shadow-sm bg-indigo-50">
                    {groupsList.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100 pb-4 md:pb-0">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md font-bold text-sm">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Thêm/Sửa NHÓM */}
      {isGroupModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4" onClick={() => setIsGroupModalOpen(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800">{editingGroup ? 'Sửa tên nhóm' : 'Thêm nhóm mới'}</h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="bg-white p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors shadow-sm">&times;</button>
            </div>
            
            <form onSubmit={handleSaveGroup} className="p-5 md:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Tên Nhóm / Phòng ban <span className="text-red-500">*</span></label>
                <input type="text" required value={groupFormName} onChange={e => setGroupFormName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm" placeholder="VD: Nhóm Marketing" />
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100 pb-4 md:pb-0">
                <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md font-bold text-sm">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Tùy chỉnh (Alert/Confirm) */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-6 transform transition-all scale-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-5 shadow-inner">
              {dialog.type === 'alert' ? <AlertCircle className="h-8 w-8 text-blue-600" /> : <Shield className="h-8 w-8 text-blue-600" />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hệ thống</h3>
            <p className="text-sm text-gray-600 mb-8 whitespace-pre-wrap leading-relaxed">{dialog.message}</p>
            <div className="flex flex-col space-y-2">
              <button 
                type="button"
                onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); closeDialog(); }} 
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              >
                Đồng ý
              </button>
              {dialog.type === 'confirm' && (
                <button type="button" onClick={closeDialog} className="w-full py-3 bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                  Hủy bỏ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
