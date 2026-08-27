import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Bed,
  HeartPulse,
  Sparkles,
  Image as ImageIcon,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MessageCircle,
  Save,
  X,
  ExternalLink,
  Users,
  User,
  Eye,
  KeyRound,
  DollarSign,
  ChevronRight,
  Filter,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Bell,
  FileText,
  CalendarDays,
  MapPin,
  Send,
  EyeOff,
} from 'lucide-react';
import {
  Booking,
  Enquiry,
  Room,
  SpaService,
  Facility,
  GalleryItem,
  WebsiteSettings,
  DashboardStats,
  AdminUser,
} from '../types.js';
import { api, getStoredToken } from '../services/api.js';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onSettingsUpdated: (newSettings: WebsiteSettings) => void;
}

type AdminTab =
  | 'overview'
  | 'bookings'
  | 'enquiries'
  | 'rooms'
  | 'services'
  | 'facilities'
  | 'gallery'
  | 'settings'
  | 'password';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToSite,
  onSettingsUpdated,
}) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<SpaService[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings | null>(null);

  // Filters & Sorting
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingSortBy, setBookingSortBy] = useState<'newest' | 'checkin' | 'amount'>('newest');
  const [enquiryFilterStatus, setEnquiryFilterStatus] = useState('all');
  const [enquirySearch, setEnquirySearch] = useState('');

  // Modals
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [viewingNoteDraft, setViewingNoteDraft] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [editingService, setEditingService] = useState<Partial<SpaService> | null>(null);
  const [editingFacility, setEditingFacility] = useState<Partial<Facility> | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<Partial<GalleryItem> | null>(null);

  // In-App Confirmation Dialog State (100% reliable inside iframes & previews)
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Password Change
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Track prev bookings count to show notification on new booking
  const prevBookingsCountRef = useRef<number | null>(null);

  // Check stored auth on load
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api
        .verifyAuth()
        .then((user) => {
          setAdminUser(user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          api.logout();
          setIsAuthenticated(false);
        });
    }
  }, []);

  // Fetch data function
  const loadTabData = async (showLoadingState = true) => {
    if (!isAuthenticated) return;
    if (showLoadingState) setIsLoading(true);
    setIsRefreshing(true);
    try {
      if (activeTab === 'overview') {
        const [s, b, e, r, sv] = await Promise.all([
          api.getAdminStats(),
          api.getAdminBookings(),
          api.getAdminEnquiries(),
          api.getAdminRooms(),
          api.getAdminServices(),
        ]);
        setStats(s);
        setBookings(b);
        setEnquiries(e);
        setRooms(r);
        setServices(sv);

        // Check for new bookings
        if (prevBookingsCountRef.current !== null && b.length > prevBookingsCountRef.current) {
          const diff = b.length - prevBookingsCountRef.current;
          showNotification('success', `🔔 ${diff} new booking${diff > 1 ? 's' : ''} received!`);
        }
        prevBookingsCountRef.current = b.length;
      } else if (activeTab === 'bookings') {
        const [b, r, sv] = await Promise.all([
          api.getAdminBookings(bookingFilterStatus, bookingSearch),
          api.getAdminRooms(),
          api.getAdminServices(),
        ]);
        setBookings(b);
        setRooms(r);
        setServices(sv);

        if (prevBookingsCountRef.current !== null && b.length > prevBookingsCountRef.current) {
          const diff = b.length - prevBookingsCountRef.current;
          showNotification('success', `🔔 ${diff} new booking${diff > 1 ? 's' : ''} updated!`);
        }
        prevBookingsCountRef.current = b.length;
      } else if (activeTab === 'enquiries') {
        const e = await api.getAdminEnquiries(enquiryFilterStatus, enquirySearch);
        setEnquiries(e);
      } else if (activeTab === 'rooms') {
        const r = await api.getAdminRooms();
        setRooms(r);
      } else if (activeTab === 'services') {
        const s = await api.getAdminServices();
        setServices(s);
      } else if (activeTab === 'facilities') {
        const f = await api.getFacilities();
        setFacilities(f);
      } else if (activeTab === 'gallery') {
        const g = await api.getGallery();
        setGallery(g);
      } else if (activeTab === 'settings') {
        const st = await api.getSettings();
        setSettingsForm(st);
      }
      setLastSyncTime(new Date());
    } catch (err: any) {
      if (showLoadingState) {
        showNotification('error', err.message || 'Failed to load data.');
      }
    } finally {
      if (showLoadingState) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data when authenticated & tab changes
  useEffect(() => {
    loadTabData(true);
  }, [isAuthenticated, activeTab, bookingFilterStatus, bookingSearch, enquiryFilterStatus, enquirySearch]);

  // Live Auto-Refresh Polling every 12 seconds for Overview and Bookings tab
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab !== 'overview' && activeTab !== 'bookings') return;

    const interval = setInterval(() => {
      loadTabData(false);
    }, 12000);

    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab, bookingFilterStatus, bookingSearch]);

  // Keep viewingNoteDraft in sync when viewingBooking changes
  useEffect(() => {
    if (viewingBooking) {
      setViewingNoteDraft(viewingBooking.internalNotes || '');
    }
  }, [viewingBooking]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
    showNotification('success', `Copied "${text}" to clipboard`);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await api.login(loginUsername, loginPassword);
      setAdminUser(res.user);
      setIsAuthenticated(true);
      showNotification('success', `Welcome back, ${res.user.name || res.user.username}!`);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  // --- BOOKING OPERATIONS ---
  const handleSaveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      const updated = await api.updateBooking(editingBooking.id, editingBooking);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      if (viewingBooking && viewingBooking.id === updated.id) {
        setViewingBooking(updated);
      }
      setEditingBooking(null);
      showNotification('success', `Booking ${updated.bookingRef} updated successfully.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update booking.');
    }
  };

  const handleSaveViewingNote = async () => {
    if (!viewingBooking) return;
    try {
      const updated = await api.updateBooking(viewingBooking.id, { internalNotes: viewingNoteDraft });
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setViewingBooking(updated);
      showNotification('success', `Internal concierge notes saved for ${updated.bookingRef}`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save notes.');
    }
  };

  const handleQuickStatusChange = async (id: string, status: Booking['status']) => {
    try {
      const updated = await api.updateBooking(id, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (viewingBooking && viewingBooking.id === id) {
        setViewingBooking(updated);
      }
      showNotification('success', `Status updated to ${status}.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update status.');
    }
  };

  const handleDeleteBooking = (id: string, ref: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Reservation',
      message: `Are you sure you want to permanently delete reservation folio ${ref}? This cannot be undone.`,
      confirmLabel: 'Delete Folio',
      onConfirm: async () => {
        try {
          await api.deleteBooking(id);
          setBookings((prev) => prev.filter((b) => b.id !== id));
          if (viewingBooking && viewingBooking.id === id) {
            setViewingBooking(null);
          }
          showNotification('success', `Booking ${ref} deleted.`);
        } catch (err: any) {
          showNotification('error', err.message || 'Failed to delete booking.');
        }
      },
    });
  };

  const handlePrintBooking = (booking: Booking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reservation Folio - ${booking.bookingRef}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1B4332; }
            .header { border-bottom: 2px solid #2D6A4F; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { font-size: 14px; color: #40916C; margin-top: 4px; }
            .ref { font-family: monospace; font-size: 20px; font-weight: bold; background: #F1F8E9; padding: 8px 16px; border-radius: 8px; display: inline-block; margin-top: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; }
            .card { background: #FAFAF5; padding: 16px; border-radius: 8px; border: 1px solid #D8F3DC; }
            .label { font-size: 11px; text-transform: uppercase; color: #40916C; font-weight: bold; margin-bottom: 4px; }
            .value { font-size: 15px; font-weight: 600; color: #1B4332; }
            .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .table th, .table td { text-align: left; padding: 10px; border-bottom: 1px solid #E2E8F0; }
            .table th { background: #F1F8E9; font-size: 12px; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; font-size: 12px; color: #718096; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">BAHAR RETREAT AND SPA</h1>
            <div class="subtitle">बाहर रिट्रीट एंड स्पा • Guest Reservation Folio</div>
            <div class="ref">${booking.bookingRef}</div>
          </div>
          <div class="grid">
            <div class="card">
              <div class="label">Guest Information</div>
              <div class="value">${booking.guestName}</div>
              <div style="font-size: 13px; color: #4A5568; margin-top: 4px;">Phone: ${booking.guestPhone}</div>
              <div style="font-size: 13px; color: #4A5568;">Email: ${booking.guestEmail}</div>
              <div style="font-size: 13px; color: #4A5568;">Guests: ${booking.adults} Adults, ${booking.children || 0} Children</div>
            </div>
            <div class="card">
              <div class="label">Stay Schedule</div>
              <div class="value">${booking.checkInDate} to ${booking.checkOutDate}</div>
              <div style="font-size: 13px; color: #4A5568; margin-top: 4px;">Room: ${booking.roomName}</div>
              ${booking.serviceName ? `<div style="font-size: 13px; color: #4A5568;">Spa Addon: ${booking.serviceName}</div>` : ''}
              <div style="font-size: 13px; color: #4A5568;">Status: ${booking.status.toUpperCase()}</div>
            </div>
          </div>
          ${booking.specialRequests ? `
            <div class="card" style="margin-bottom: 20px;">
              <div class="label">Special Guest Requests</div>
              <div class="value" style="font-weight: normal; font-size: 14px;">${booking.specialRequests}</div>
            </div>
          ` : ''}
          ${booking.internalNotes ? `
            <div class="card" style="margin-bottom: 20px;">
              <div class="label">Internal Concierge Notes</div>
              <div class="value" style="font-weight: normal; font-size: 14px;">${booking.internalNotes}</div>
            </div>
          ` : ''}
          <div class="total">Total Estimated Amount: ₹${(booking.totalAmount || 0).toLocaleString()}</div>
          <div class="footer">
            Bahar Retreat And Spa • Development Area, Near Pushpa Garage, Gangtok, Sikkim - 737101 • Phone: +91 98765 43210 • stay@baharretreat.com
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSendWhatsAppConfirmation = (booking: Booking) => {
    const text = `Namaste ${booking.guestName} ji, greetings from Bahar Retreat And Spa! 🌿✨\n\nYour reservation details are confirmed as follows:\n- Booking Ref: ${booking.bookingRef}\n- Accommodation: ${booking.roomName}\n- Check-In: ${booking.checkInDate} (From 14:00)\n- Check-Out: ${booking.checkOutDate} (Till 11:00)\n- Total Guests: ${booking.adults} Adults${booking.children ? `, ${booking.children} Children` : ''}\n- Estimated Amount: ₹${(booking.totalAmount || 0).toLocaleString()}\n\nOur concierge is delighted to welcome you to our mountain sanctuary. Please let us know if you have any special meal or arrival preferences!`;
    const cleanPhone = booking.guestPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showNotification('success', `Copied ${text} to clipboard!`);
    }
  };

  // --- ENQUIRY OPERATIONS ---
  const handleUpdateEnquiryStatus = async (id: string, status: Enquiry['status']) => {
    try {
      const updated = await api.updateEnquiry(id, { status });
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      showNotification('success', `Enquiry marked as ${status}.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update enquiry.');
    }
  };

  const handleDeleteEnquiry = (id: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Message',
      message: 'Are you sure you want to permanently delete this guest inquiry message?',
      confirmLabel: 'Delete Message',
      onConfirm: async () => {
        try {
          await api.deleteEnquiry(id);
          setEnquiries((prev) => prev.filter((e) => e.id !== id));
          showNotification('success', 'Enquiry deleted.');
        } catch (err: any) {
          showNotification('error', err.message || 'Failed to delete enquiry.');
        }
      },
    });
  };

  // --- ROOM OPERATIONS ---
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      if (editingRoom.id) {
        const updated = await api.updateRoom(editingRoom.id, editingRoom);
        setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        showNotification('success', 'Room updated successfully.');
      } else {
        const created = await api.createRoom(editingRoom);
        setRooms((prev) => [...prev, created]);
        showNotification('success', 'New room created.');
      }
      setEditingRoom(null);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save room.');
    }
  };

  const handleDeleteRoom = (id: string, name: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Room',
      message: `Are you sure you want to permanently delete accommodation "${name}"?`,
      confirmLabel: 'Delete Room',
      onConfirm: async () => {
        try {
          await api.deleteRoom(id);
          setRooms((prev) => prev.filter((r) => r.id !== id));
          showNotification('success', `Room "${name}" removed.`);
        } catch (err: any) {
          showNotification('error', err.message || 'Failed to delete room.');
        }
      },
    });
  };

  // --- SPA SERVICE OPERATIONS ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      if (editingService.id) {
        const updated = await api.updateService(editingService.id, editingService);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        showNotification('success', 'Spa therapy updated.');
      } else {
        const created = await api.createService(editingService);
        setServices((prev) => [...prev, created]);
        showNotification('success', 'New spa therapy created.');
      }
      setEditingService(null);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save service.');
    }
  };

  const handleDeleteService = (id: string, name: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Spa Treatment',
      message: `Are you sure you want to permanently delete spa treatment "${name}"?`,
      confirmLabel: 'Delete Treatment',
      onConfirm: async () => {
        try {
          await api.deleteService(id);
          setServices((prev) => prev.filter((s) => s.id !== id));
          showNotification('success', `Spa service "${name}" deleted.`);
        } catch (err: any) {
          showNotification('error', err.message || 'Failed to delete service.');
        }
      },
    });
  };

  // --- GALLERY OPERATIONS ---
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem) return;

    try {
      if (editingGalleryItem.id) {
        const updated = await api.updateGalleryItem(editingGalleryItem.id, editingGalleryItem);
        setGallery((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        showNotification('success', 'Gallery item updated.');
      } else {
        const created = await api.createGalleryItem(editingGalleryItem);
        setGallery((prev) => [...prev, created]);
        showNotification('success', 'Image added to gallery.');
      }
      setEditingGalleryItem(null);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save gallery item.');
    }
  };

  const handleDeleteGallery = (id: string, title?: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Gallery Photo',
      message: `Are you sure you want to permanently remove ${title ? `"${title}"` : 'this photo'} from the resort gallery?`,
      confirmLabel: 'Delete Photo',
      onConfirm: async () => {
        try {
          await api.deleteGalleryItem(id);
          setGallery((prev) => prev.filter((g) => g.id !== id));
          if (editingGalleryItem && editingGalleryItem.id === id) {
            setEditingGalleryItem(null);
          }
          showNotification('success', 'Gallery photo deleted successfully.');
        } catch (err: any) {
          showNotification('error', err.message || 'Failed to delete photo.');
        }
      },
    });
  };

  // --- SETTINGS OPERATIONS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      const updated = await api.updateSettings(settingsForm);
      setSettingsForm(updated);
      onSettingsUpdated(updated);
      showNotification('success', 'Website settings and contact details updated.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update settings.');
    }
  };

  // --- PASSWORD OPERATIONS ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showNotification('error', 'New passwords do not match.');
      return;
    }
    try {
      await api.changePassword(currPass, newPass);
      showNotification('success', 'Admin password changed successfully.');
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to change password.');
    }
  };

  // =========================================================================
  // LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1B4332] flex flex-col justify-center items-center p-4 relative overflow-hidden text-[#1B4332]">
        {/* Background glow and subtle ambient elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2D6A4F]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#52B788]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="bg-[#FAFAF5] rounded-3xl max-w-md w-full p-7 sm:p-9 shadow-2xl border border-[#D8F3DC]/60 relative z-10 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-lg border border-[#D8F3DC] p-2 overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/d/1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC"
                alt="Bahar Retreat And Spa Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC';
                }}
              />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332]">
              Management Portal
            </h2>
            <p className="text-xs text-[#40916C] font-semibold uppercase tracking-wider">
              Bahar Retreat And Spa • बाहर रिट्रीट एंड स्पा
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <input
                  id="admin-username-input"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  placeholder="admin"
                  className="w-full px-4 py-2.5 bg-white border border-[#1B4332]/20 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-white border border-[#1B4332]/20 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none transition shadow-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B4332]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
            >
              {loginLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Control Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onBackToSite}
              className="text-xs font-bold text-[#40916C] hover:text-[#1B4332] hover:underline"
            >
              ← Return to Resort Website
            </button>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div id="admin-dashboard" className="min-h-screen bg-[#FAFAF5] text-[#1B4332] flex flex-col pt-20">
      
      {/* Top Admin Navigation Header */}
      <header className="bg-[#1B4332] text-white fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between border-b border-[#2D6A4F]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 border border-[#52B788]/40 shadow-sm overflow-hidden shrink-0">
            <img
              src="https://lh3.googleusercontent.com/d/1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC"
              alt="Bahar Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC';
              }}
            />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-wide block">
              Bahar Retreat Management
            </span>
            <span className="text-[10px] text-[#D8F3DC]/80 block">
              बाहर रिट्रीट एंड स्पा • Owner & Operations Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Live Sync Status & Manual Refresh Button */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#2D6A4F]/60 border border-[#52B788]/30 text-xs text-[#D8F3DC]">
            <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
            <span>Live Sync Active</span>
            <span className="text-[10px] text-white/60">
              ({lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          </div>

          <button
            id="admin-sync-btn"
            onClick={() => loadTabData(true)}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#40916C] text-[#D8F3DC] hover:text-white text-xs font-semibold border border-[#52B788]/40 flex items-center space-x-1.5 transition"
            title="Refresh bookings and database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

          <button
            onClick={onBackToSite}
            className="px-3 py-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#40916C] text-[#D8F3DC] hover:text-white text-xs font-semibold border border-[#52B788]/40 flex items-center space-x-1 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-900/70 hover:bg-rose-800 text-rose-100 hover:text-white text-xs font-semibold border border-rose-700/50 flex items-center space-x-1 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-500'
              : 'bg-rose-800 text-white border border-rose-500'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-emerald-100 p-3 shrink-0 flex flex-col justify-between">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'overview' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'bookings' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4" />
                <span>Bookings</span>
              </div>
              {stats?.newBookings ? (
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-emerald-950 rounded-full font-extrabold">
                  {stats.newBookings} new
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('enquiries')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'enquiries' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-4 h-4" />
                <span>Enquiries</span>
              </div>
              {stats?.newEnquiries ? (
                <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-amber-950 rounded-full font-extrabold">
                  {stats.newEnquiries}
                </span>
              ) : null}
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Content Catalog
            </div>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'rooms' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Rooms & Villas</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'services' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Spa & Wellness</span>
            </button>

            <button
              onClick={() => setActiveTab('facilities')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'facilities' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Resort Facilities</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'gallery' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photo Gallery</span>
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              System Settings
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'settings' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website & SEO</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'password' ? 'bg-emerald-800 text-white shadow' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </nav>
        </aside>

        {/* Right Tab Content Container */}
        <main className="flex-1 min-w-0">
          
          {/* =========================================================================
              TAB: OVERVIEW
             ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#D8F3DC] shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] block">
                    Total Bookings
                  </span>
                  <span className="font-serif text-3xl font-bold text-[#1B4332] mt-1 block">
                    {stats?.totalBookings ?? bookings.length}
                  </span>
                  <span className="text-[11px] text-[#40916C] font-medium">
                    All-time recorded
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D8F3DC] shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] block">
                    New Enquiries
                  </span>
                  <span className="font-serif text-3xl font-bold text-amber-700 mt-1 block">
                    {stats?.newEnquiries ?? 0}
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium">
                    Awaiting response
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D8F3DC] shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] block">
                    Confirmed Stays
                  </span>
                  <span className="font-serif text-3xl font-bold text-[#2D6A4F] mt-1 block">
                    {stats?.confirmedBookings ?? 0}
                  </span>
                  <span className="text-[11px] text-[#40916C] font-medium">
                    Ready for check-in
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D8F3DC] shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] block">
                    Active Catalog
                  </span>
                  <span className="font-serif text-3xl font-bold text-[#1B4332] mt-1 block">
                    {(stats?.totalRooms ?? 0) + (stats?.totalServices ?? 0)}
                  </span>
                  <span className="text-[11px] text-[#40916C] font-medium">
                    Villas & Spa Services
                  </span>
                </div>
              </div>

              {/* Recent Bookings Quick Table */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D8F3DC] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1B4332]">
                      Recent Customer Bookings
                    </h3>
                    <p className="text-xs text-[#40916C]">
                      Showing the most recent guest reservations submitted to the resort.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-bold text-[#2D6A4F] hover:underline"
                  >
                    View All Bookings ({bookings.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#D8F3DC] text-[#1B4332] font-bold uppercase tracking-wider">
                        <th className="pb-2.5">Ref ID</th>
                        <th className="pb-2.5">Guest</th>
                        <th className="pb-2.5">Stay Dates</th>
                        <th className="pb-2.5">Room & Total</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8F3DC]/60">
                      {bookings.slice(0, 6).map((b) => (
                        <tr key={b.id} className="hover:bg-[#FAFAF5]/80 transition">
                          <td className="py-3 font-mono font-bold text-[#1B4332]">
                            <button
                              onClick={() => setViewingBooking(b)}
                              className="hover:underline text-[#2D6A4F] font-bold flex items-center space-x-1"
                              title="Click to view full booking details"
                            >
                              <span>{b.bookingRef}</span>
                            </button>
                          </td>
                          <td className="py-3 font-medium">
                            <div className="font-bold text-[#1B4332]">{b.guestName}</div>
                            <div className="text-[10px] text-gray-500">{b.guestPhone}</div>
                          </td>
                          <td className="py-3 text-gray-600">
                            {b.checkInDate} → {b.checkOutDate}
                          </td>
                          <td className="py-3">
                            <div className="font-semibold text-[#1B4332]">{b.roomName}</div>
                            <div className="text-[10px] text-[#2D6A4F] font-bold">
                              ₹{(b.totalAmount || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                b.status === 'confirmed'
                                  ? 'bg-[#D8F3DC] text-[#1B4332]'
                                  : b.status === 'new'
                                  ? 'bg-blue-100 text-blue-800'
                                  : b.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => setViewingBooking(b)}
                              className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg font-semibold text-[11px] inline-flex items-center space-x-1"
                              title="View full customer details"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => setEditingBooking(b)}
                              className="px-2.5 py-1 bg-[#D8F3DC] hover:bg-[#b7e4c7] text-[#1B4332] rounded-lg font-semibold text-[11px] inline-flex items-center space-x-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB: BOOKINGS (FULL OWNER VIEW, SEARCH, FILTER, SORT, ACTIONS)
             ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              
              {/* Header & Filter Controls */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D8F3DC] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1B4332]">
                      Guest Bookings & Reservations ({bookings.length})
                    </h3>
                    <p className="text-xs text-[#40916C]">
                      Manage customer bookings, guest details, room allocations, special requests, and payments.
                    </p>
                  </div>

                  {/* Search Bar & Sorting */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-56">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                      <input
                        id="booking-search-input"
                        type="text"
                        placeholder="Search guest, ref, phone..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAFAF5] border border-[#D8F3DC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-[#1B4332]"
                      />
                    </div>

                    <select
                      value={bookingSortBy}
                      onChange={(e) => setBookingSortBy(e.target.value as any)}
                      className="text-xs px-3 py-2 bg-[#FAFAF5] border border-[#D8F3DC] rounded-lg font-medium text-[#1B4332] focus:outline-none"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="checkin">Sort: Check-in Date</option>
                      <option value="amount">Sort: Amount (High-Low)</option>
                    </select>
                  </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D8F3DC]/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center">
                    <Filter className="w-3 h-3 mr-1" /> Filter:
                  </span>
                  {(['all', 'new', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => {
                    const count =
                      status === 'all'
                        ? bookings.length
                        : bookings.filter((b) => b.status === status).length;
                    const isActive = bookingFilterStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setBookingFilterStatus(status)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-[#1B4332] text-white shadow-sm'
                            : 'bg-[#FAFAF5] hover:bg-[#D8F3DC] text-[#1B4332] border border-[#D8F3DC]'
                        }`}
                      >
                        <span className="capitalize">{status}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            isActive ? 'bg-[#52B788] text-[#1B4332]' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bookings List Cards */}
              <div className="space-y-3">
                {bookings
                  .slice()
                  .sort((a, b) => {
                    if (bookingSortBy === 'amount') {
                      return (b.totalAmount || 0) - (a.totalAmount || 0);
                    }
                    if (bookingSortBy === 'checkin') {
                      return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
                    }
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  })
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-[#D8F3DC] hover:border-[#2D6A4F]/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setViewingBooking(booking)}
                            className="font-mono text-sm font-extrabold text-[#1B4332] bg-[#D8F3DC] hover:bg-[#b7e4c7] px-2.5 py-1 rounded-md border border-[#2D6A4F]/20 flex items-center space-x-1 transition"
                            title="Click to open customer details modal"
                          >
                            <span>{booking.bookingRef}</span>
                            <Eye className="w-3 h-3 text-[#2D6A4F]" />
                          </button>

                          <select
                            value={booking.status}
                            onChange={(e) => handleQuickStatusChange(booking.id, e.target.value as Booking['status'])}
                            className={`text-xs font-bold uppercase rounded-md px-2 py-1 border cursor-pointer ${
                              booking.status === 'confirmed'
                                ? 'bg-[#D8F3DC] text-[#1B4332] border-[#2D6A4F]/40'
                                : booking.status === 'new'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : booking.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <span className="text-[11px] text-gray-500">
                            Booked on: {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500 block text-[11px] uppercase font-semibold">Guest Contact</span>
                            <span className="font-bold text-sm text-[#1B4332] block">{booking.guestName}</span>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-gray-600 font-mono text-[11px]">{booking.guestPhone}</span>
                              <a
                                href={`https://wa.me/${booking.guestPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-800"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`tel:${booking.guestPhone}`}
                                className="text-emerald-600 hover:text-emerald-800"
                                title="Call Guest"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-500 block text-[11px] uppercase font-semibold">Stay Schedule</span>
                            <span className="font-medium text-[#1B4332] block">
                              {booking.checkInDate} → {booking.checkOutDate}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {booking.adults} Adults{booking.children ? `, ${booking.children} Kids` : ''}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-500 block text-[11px] uppercase font-semibold">Accommodation</span>
                            <span className="font-semibold text-[#1B4332] block">{booking.roomName}</span>
                            {booking.serviceName ? (
                              <span className="text-[11px] text-[#2D6A4F] block">
                                + {booking.serviceName}
                              </span>
                            ) : null}
                          </div>

                          <div>
                            <span className="text-gray-500 block text-[11px] uppercase font-semibold">Total Stay Value</span>
                            <span className="text-base font-extrabold text-[#1B4332] block">
                              ₹{(booking.totalAmount || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#40916C]">
                              All inclusive estimate
                            </span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200">
                            <strong>Guest Special Requests:</strong> {booking.specialRequests}
                          </div>
                        )}

                        {booking.internalNotes && (
                          <div className="text-xs bg-[#FAFAF5] text-slate-700 p-2.5 rounded-xl border border-[#D8F3DC]">
                            <strong>Staff Internal Notes:</strong> {booking.internalNotes}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#D8F3DC]">
                        <button
                          id={`view-booking-btn-${booking.bookingRef}`}
                          onClick={() => setViewingBooking(booking)}
                          className="px-3.5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <div className="flex items-center space-x-1.5">
                          <button
                            id={`edit-booking-btn-${booking.bookingRef}`}
                            onClick={() => setEditingBooking(booking)}
                            className="px-3 py-1.5 bg-[#D8F3DC] hover:bg-[#b7e4c7] text-[#1B4332] rounded-lg text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handlePrintBooking(booking)}
                            className="p-2 hover:bg-gray-100 text-gray-600 hover:text-[#1B4332] rounded-lg text-xs transition"
                            title="Print Folio / Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteBooking(booking.id, booking.bookingRef)}
                            className="p-2 hover:bg-rose-50 text-rose-600 hover:text-rose-800 rounded-lg text-xs transition"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {bookings.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-[#D8F3DC]">
                    No bookings found matching the current search/filter.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB: ENQUIRIES
             ========================================================================= */}
          {activeTab === 'enquiries' && (
            <div className="space-y-4">
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-emerald-950">
                    Contact Enquiries
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Inquiries received from the public website contact form.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={enquiryFilterStatus}
                    onChange={(e) => setEnquiryFilterStatus(e.target.value)}
                    className="text-xs px-3 py-2 bg-emerald-50/60 border border-emerald-200 rounded-lg font-medium text-emerald-950"
                  >
                    <option value="all">All Enquiries</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-emerald-950">{enq.name}</span>
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value as Enquiry['status'])}
                          className="text-[11px] font-bold uppercase rounded-md px-2 py-0.5 border bg-emerald-50 text-emerald-900 border-emerald-300"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {new Date(enq.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 flex items-center space-x-4">
                      <span><strong>Phone:</strong> {enq.phone}</span>
                      <span><strong>Email:</strong> {enq.email}</span>
                      <span><strong>Subject:</strong> {enq.subject}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed">
                      {enq.message}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-50">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${enq.name}, replying to your enquiry at Bahar Retreat And Spa.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Reply WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${enq.phone}`}
                          className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </div>

                      <button
                        onClick={() => handleDeleteEnquiry(enq.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 hover:underline"
                      >
                        Delete Enquiry
                      </button>
                    </div>
                  </div>
                ))}

                {enquiries.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-emerald-100">
                    No enquiries recorded.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB: ROOMS CRUD
             ========================================================================= */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-emerald-950">
                    Rooms & Villas Catalog
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Add new cottages, adjust nightly rates, edit descriptions & amenities.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingRoom({
                      name: '',
                      hindiName: '',
                      tagline: '',
                      description: '',
                      pricePerNight: 9000,
                      capacityAdults: 2,
                      capacityChildren: 1,
                      bedType: '1 King Bed',
                      sizeSqFt: 500,
                      featuredImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
                      galleryImages: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
                      amenities: ['Forest View', 'Wi-Fi', 'Private Balcony', 'Room Service'],
                      isAvailable: true,
                      isActive: true,
                    })
                  }
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Room</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={r.featuredImage}
                        alt={r.name}
                        className="w-24 h-24 rounded-xl object-cover shrink-0 bg-emerald-900"
                      />
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-serif font-bold text-base text-emerald-950 truncate">
                          {r.name}
                        </h4>
                        {r.hindiName && (
                          <p className="text-xs text-emerald-600">{r.hindiName}</p>
                        )}
                        <p className="text-xs font-bold text-emerald-800">
                          ₹{r.pricePerNight.toLocaleString()} / night
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{r.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-50 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {r.isActive ? 'Active on Website' : 'Disabled'}
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingRoom(r)}
                          className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-semibold text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r.id, r.name)}
                          className="p-1 text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB: SPA SERVICES CRUD
             ========================================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-emerald-950">
                    Spa & Wellness Therapies
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Manage Ayurvedic therapies, massages, session duration and pricing.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingService({
                      name: '',
                      hindiName: '',
                      category: 'Ayurveda',
                      durationMinutes: 60,
                      price: 3500,
                      description: '',
                      benefits: ['Deep Relaxation', 'Detoxification'],
                      featuredImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
                      isActive: true,
                    })
                  }
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Spa Treatment</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={s.featuredImage}
                        alt={s.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 bg-emerald-900"
                      />
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {s.category}
                        </span>
                        <h4 className="font-serif font-bold text-base text-emerald-950 truncate">
                          {s.name}
                        </h4>
                        <p className="text-xs font-bold text-emerald-800">
                          ₹{s.price.toLocaleString()} • {s.durationMinutes} Mins
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-50 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {s.isActive ? 'Active' : 'Disabled'}
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingService(s)}
                          className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-semibold text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id, s.name)}
                          className="p-1 text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB: GALLERY CRUD
             ========================================================================= */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-emerald-950">
                    Photo Gallery Manager
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Add high-resolution photos, adjust categories, captions, and alt text.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingGalleryItem({
                      title: '',
                      category: 'property',
                      imageUrl: '',
                      caption: '',
                      altText: 'Bahar Retreat And Spa',
                      order: gallery.length + 1,
                    })
                  }
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((g) => (
                  <div
                    key={g.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100 group relative flex flex-col"
                  >
                    <div className="h-40 bg-emerald-950 relative overflow-hidden">
                      <img
                        src={g.imageUrl}
                        alt={g.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-2 right-2 bg-emerald-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {g.category}
                      </div>
                    </div>

                    <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-emerald-950 truncate">{g.title}</h4>
                        {g.caption && <p className="text-[11px] text-gray-500 line-clamp-1">{g.caption}</p>}
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-emerald-50">
                        <button
                          type="button"
                          onClick={() => setEditingGalleryItem(g)}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGallery(g.id, g.title)}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center space-x-1"
                          title={`Delete ${g.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB: WEBSITE SETTINGS
             ========================================================================= */}
          {activeTab === 'settings' && settingsForm && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-100 space-y-6">
              
              <div>
                <h3 className="font-serif text-2xl font-bold text-emerald-950">
                  Website, SEO & Contact Configuration
                </h3>
                <p className="text-xs text-emerald-700">
                  Manage business names, contact phone numbers, WhatsApp numbers, physical address, and social links.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Branding */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-2">
                    1. Brand Identity & Logo
                  </h4>
                  
                  {/* Logo URL & Preview */}
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-300 p-1.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={settingsForm.logoUrl || 'https://lh3.googleusercontent.com/d/1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC'}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC';
                        }}
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">
                        Resort Logo URL (Google Drive / Direct Image link)
                      </label>
                      <input
                        type="url"
                        value={settingsForm.logoUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                        placeholder="https://lh3.googleusercontent.com/d/..."
                        className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Current default: Bahar Retreat And Spa official crest.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Business Name (English)</label>
                      <input
                        type="text"
                        value={settingsForm.businessName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                        required
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Business Name (Hindi)</label>
                      <input
                        type="text"
                        value={settingsForm.businessNameHindi}
                        onChange={(e) => setSettingsForm({ ...settingsForm, businessNameHindi: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Tagline (English)</label>
                      <input
                        type="text"
                        value={settingsForm.tagline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Tagline (Hindi)</label>
                      <input
                        type="text"
                        value={settingsForm.taglineHindi}
                        onChange={(e) => setSettingsForm({ ...settingsForm, taglineHindi: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Contacts */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-2">
                    2. Reception Phone & WhatsApp Numbers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Primary Phone</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        required
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">WhatsApp Number</label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        required
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        required
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-2">
                    3. Address & Google Maps
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Address (English)</label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Address (Hindi)</label>
                      <input
                        type="text"
                        value={settingsForm.addressHindi}
                        onChange={(e) => setSettingsForm({ ...settingsForm, addressHindi: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Google Maps Link URL</label>
                      <input
                        type="text"
                        value={settingsForm.googleMapsUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Channels */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-2">
                    4. Social Media Channels
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Facebook URL</label>
                      <input
                        type="text"
                        value={settingsForm.facebookUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Instagram URL</label>
                      <input
                        type="text"
                        value={settingsForm.instagramUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">YouTube URL</label>
                      <input
                        type="text"
                        value={settingsForm.youtubeUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-2">
                    5. Search Engine Optimization (SEO)
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">SEO Title Tag</label>
                    <input
                      type="text"
                      value={settingsForm.seoTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, seoTitle: e.target.value })}
                      className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={settingsForm.seoDescription}
                      onChange={(e) => setSettingsForm({ ...settingsForm, seoDescription: e.target.value })}
                      className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm tracking-wider uppercase shadow-md flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>

              </form>
            </div>
          )}

          {/* =========================================================================
              TAB: PASSWORD CHANGER
             ========================================================================= */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-100 max-w-lg space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-emerald-950">
                  Change Administrator Password
                </h3>
                <p className="text-xs text-emerald-700">
                  Update your owner credentials with cryptographic bcrypt hashing.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm tracking-wide uppercase shadow"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          CRITICAL MODAL: VIEW FULL CUSTOMER BOOKING DOSSIER
         ========================================================================= */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/80 backdrop-blur-md overflow-y-auto animate-fadeIn text-[#1B4332]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#D8F3DC] max-h-[90vh] overflow-y-auto my-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#D8F3DC] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F] block">
                  Customer Reservation Dossier
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <h3 className="font-serif text-2xl font-bold text-[#1B4332]">
                    Ref: {viewingBooking.bookingRef}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(viewingBooking.bookingRef)}
                    className="p-1.5 hover:bg-[#D8F3DC] text-[#2D6A4F] rounded-lg text-xs flex items-center space-x-1 border border-[#D8F3DC]"
                    title="Copy Reference Number"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Copy</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    viewingBooking.status === 'confirmed'
                      ? 'bg-[#D8F3DC] text-[#1B4332]'
                      : viewingBooking.status === 'new'
                      ? 'bg-blue-100 text-blue-800'
                      : viewingBooking.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {viewingBooking.status}
                </span>
                <button
                  onClick={() => setViewingBooking(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-[#FAFAF5] p-3.5 rounded-2xl border border-[#D8F3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#1B4332] flex items-center">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] mr-1.5" /> Update Reservation Status:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['new', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleQuickStatusChange(viewingBooking.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                      viewingBooking.status === st
                        ? 'bg-[#1B4332] text-white shadow-sm'
                        : 'bg-white hover:bg-[#D8F3DC] text-[#1B4332] border border-[#D8F3DC]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Dossier Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Guest Profile */}
              <div className="bg-white p-4 rounded-2xl border border-[#D8F3DC] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5" /> Guest Contact Profile
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-semibold">Full Name</span>
                    <span className="font-bold text-sm text-[#1B4332]">{viewingBooking.guestName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-semibold">Phone & WhatsApp</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-mono font-bold text-[#1B4332]">{viewingBooking.guestPhone}</span>
                      <a
                        href={`https://wa.me/${viewingBooking.guestPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${viewingBooking.guestPhone}`}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-semibold">Email Address</span>
                    <a
                      href={`mailto:${viewingBooking.guestEmail}`}
                      className="text-[#2D6A4F] hover:underline font-medium break-all"
                    >
                      {viewingBooking.guestEmail}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-semibold">Total Guests</span>
                    <span className="font-medium text-[#1B4332]">
                      {viewingBooking.adults} Adults{viewingBooking.children ? `, ${viewingBooking.children} Children` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stay & Room Info */}
              <div className="bg-white p-4 rounded-2xl border border-[#D8F3DC] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Stay Details & Valuation
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-semibold">Villa / Accommodation</span>
                    <span className="font-bold text-sm text-[#1B4332]">{viewingBooking.roomName}</span>
                  </div>
                  {viewingBooking.serviceName && (
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-semibold">Spa & Wellness Package</span>
                      <span className="font-semibold text-[#2D6A4F]">{viewingBooking.serviceName}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-semibold">Check-In</span>
                      <span className="font-mono font-bold text-[#1B4332]">{viewingBooking.checkInDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-semibold">Check-Out</span>
                      <span className="font-mono font-bold text-[#1B4332]">{viewingBooking.checkOutDate}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#D8F3DC]">
                    <span className="text-gray-500 block text-[10px] uppercase font-semibold">Total Stay Value</span>
                    <span className="font-serif text-xl font-bold text-[#1B4332]">
                      ₹{(viewingBooking.totalAmount || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Submitted via online booking portal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {viewingBooking.specialRequests ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                  Guest Special Requests & Notes:
                </span>
                <p className="text-xs text-amber-950 italic">
                  "{viewingBooking.specialRequests}"
                </p>
              </div>
            ) : (
              <div className="p-3 bg-[#FAFAF5] rounded-xl border border-[#D8F3DC] text-xs text-gray-500 italic">
                No special requests provided by guest.
              </div>
            )}

            {/* Concierge / Staff Notes Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B4332] block">
                  Staff & Concierge Private Notes:
                </label>
                <span className="text-[10px] text-gray-500">Only visible to resort management</span>
              </div>
              <textarea
                rows={2}
                placeholder="Add room preferences, payment tracking, airport pick-up notes..."
                value={viewingBooking.internalNotes || ''}
                onChange={(e) => setViewingBooking({ ...viewingBooking, internalNotes: e.target.value })}
                className="w-full p-3 bg-[#FAFAF5] border border-[#D8F3DC] rounded-xl text-xs resize-none text-[#1B4332] focus:ring-1 focus:ring-[#2D6A4F] focus:outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.updateBooking(viewingBooking.id, { internalNotes: viewingBooking.internalNotes });
                    showNotification('success', 'Internal notes saved successfully');
                    loadTabData(false);
                  } catch (err: any) {
                    showNotification('error', err.message || 'Failed to save note');
                  }
                }}
                className="px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold rounded-lg transition"
              >
                Save Staff Notes
              </button>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#D8F3DC]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppConfirmation(viewingBooking)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintBooking(viewingBooking)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Folio / Voucher</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = { ...viewingBooking };
                    setViewingBooking(null);
                    setEditingBooking(toEdit);
                  }}
                  className="px-4 py-2 bg-[#D8F3DC] hover:bg-[#b7e4c7] text-[#1B4332] rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Booking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingBooking(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          CRITICAL MODAL: EDIT SUBMITTED BOOKING DETAILS
         ========================================================================= */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn text-emerald-950">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Owner Edit Portal
                </span>
                <h3 className="font-serif text-2xl font-bold text-emerald-950">
                  Edit Booking: {editingBooking.bookingRef}
                </h3>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookingEdit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Guest Name</label>
                  <input
                    type="text"
                    value={editingBooking.guestName}
                    onChange={(e) => setEditingBooking({ ...editingBooking, guestName: e.target.value })}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingBooking.guestPhone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, guestPhone: e.target.value })}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Guest Email</label>
                  <input
                    type="email"
                    value={editingBooking.guestEmail}
                    onChange={(e) => setEditingBooking({ ...editingBooking, guestEmail: e.target.value })}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Booking Status</label>
                  <select
                    value={editingBooking.status}
                    onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as Booking['status'] })}
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-bold"
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    value={editingBooking.checkInDate}
                    onChange={(e) => setEditingBooking({ ...editingBooking, checkInDate: e.target.value })}
                    required
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    value={editingBooking.checkOutDate}
                    onChange={(e) => setEditingBooking({ ...editingBooking, checkOutDate: e.target.value })}
                    required
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Adults</label>
                  <input
                    type="number"
                    min={1}
                    value={editingBooking.adults}
                    onChange={(e) => setEditingBooking({ ...editingBooking, adults: Number(e.target.value) })}
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Children</label>
                  <input
                    type="number"
                    min={0}
                    value={editingBooking.children}
                    onChange={(e) => setEditingBooking({ ...editingBooking, children: Number(e.target.value) })}
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Assigned Room / Villa</label>
                  <select
                    value={editingBooking.roomId}
                    onChange={(e) => {
                      const selected = rooms.find((r) => r.id === e.target.value);
                      setEditingBooking({
                        ...editingBooking,
                        roomId: e.target.value,
                        roomName: selected ? selected.name : 'Custom Villa',
                      });
                    }}
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Total Stay Amount (₹)</label>
                  <input
                    type="number"
                    value={editingBooking.totalAmount || 0}
                    onChange={(e) => setEditingBooking({ ...editingBooking, totalAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Guest Special Requests</label>
                <textarea
                  rows={2}
                  value={editingBooking.specialRequests || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, specialRequests: e.target.value })}
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Internal Staff & Concierge Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. VIP guest, arranged airport pickup, paid advance..."
                  value={editingBooking.internalNotes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, internalNotes: e.target.value })}
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / CREATE ROOM
         ========================================================================= */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn text-emerald-950">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-2xl font-bold text-emerald-950">
                {editingRoom.id ? 'Edit Villa / Cottage' : 'Add New Accommodation'}
              </h3>
              <button onClick={() => setEditingRoom(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Room Name (English) *</label>
                  <input
                    type="text"
                    value={editingRoom.name || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Room Name (Hindi)</label>
                  <input
                    type="text"
                    value={editingRoom.hindiName || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, hindiName: e.target.value })}
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Tagline / Short Summary</label>
                <input
                  type="text"
                  value={editingRoom.tagline || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, tagline: e.target.value })}
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingRoom.description || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Price (₹/night) *</label>
                  <input
                    type="number"
                    value={editingRoom.pricePerNight || 0}
                    onChange={(e) => setEditingRoom({ ...editingRoom, pricePerNight: Number(e.target.value) })}
                    required
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Adults Cap</label>
                  <input
                    type="number"
                    value={editingRoom.capacityAdults || 2}
                    onChange={(e) => setEditingRoom({ ...editingRoom, capacityAdults: Number(e.target.value) })}
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Bed Type</label>
                  <input
                    type="text"
                    value={editingRoom.bedType || '1 King Bed'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedType: e.target.value })}
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Size (Sq.Ft)</label>
                  <input
                    type="number"
                    value={editingRoom.sizeSqFt || 500}
                    onChange={(e) => setEditingRoom({ ...editingRoom, sizeSqFt: Number(e.target.value) })}
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Featured Photo Image URL</label>
                <input
                  type="text"
                  value={editingRoom.featuredImage || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, featuredImage: e.target.value })}
                  required
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={editingRoom.amenities?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      amenities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 text-xs font-bold text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.isActive !== false}
                    onChange={(e) => setEditingRoom({ ...editingRoom, isActive: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Active & Visible on Website</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.isAvailable !== false}
                    onChange={(e) => setEditingRoom({ ...editingRoom, isAvailable: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Available for Direct Booking</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Accommodation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / CREATE SPA SERVICE
         ========================================================================= */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn text-emerald-950">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-2xl font-bold text-emerald-950">
                {editingService.id ? 'Edit Spa Therapy' : 'Add New Spa Therapy'}
              </h3>
              <button onClick={() => setEditingService(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Service Name *</label>
                  <input
                    type="text"
                    value={editingService.name || ''}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Category</label>
                  <select
                    value={editingService.category || 'Ayurveda'}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="Ayurveda">Ayurveda</option>
                    <option value="Massage">Massage</option>
                    <option value="Facial">Facial</option>
                    <option value="Body Rituals">Body Rituals</option>
                    <option value="Yoga & Meditation">Yoga & Meditation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    value={editingService.durationMinutes || 60}
                    onChange={(e) => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={editingService.price || 0}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingService.featuredImage || ''}
                  onChange={(e) => setEditingService({ ...editingService, featuredImage: e.target.value })}
                  required
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Benefits (Comma separated)</label>
                <input
                  type="text"
                  value={editingService.benefits?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      benefits: e.target.value.split(',').map((b) => b.trim()).filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Spa Therapy
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / CREATE GALLERY ITEM
         ========================================================================= */}
      {editingGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn text-emerald-950">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-2xl font-bold text-emerald-950">
                {editingGalleryItem.id ? 'Edit Gallery Photo' : 'Add Photo to Gallery'}
              </h3>
              <button onClick={() => setEditingGalleryItem(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Image Title *</label>
                <input
                  type="text"
                  value={editingGalleryItem.title || ''}
                  onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                  required
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Category</label>
                <select
                  value={editingGalleryItem.category || 'property'}
                  onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, category: e.target.value as any })}
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-semibold"
                >
                  <option value="property">Property & Views</option>
                  <option value="rooms">Rooms & Villas</option>
                  <option value="spa">Spa & Wellness</option>
                  <option value="dining">Organic Dining</option>
                  <option value="nature">Flora & Trails</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Image URL *</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={editingGalleryItem.imageUrl || ''}
                  onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, imageUrl: e.target.value })}
                  required
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Caption / Subtitle</label>
                <input
                  type="text"
                  value={editingGalleryItem.caption || ''}
                  onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, caption: e.target.value })}
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">Image Alt Text (for SEO)</label>
                <input
                  type="text"
                  value={editingGalleryItem.altText || ''}
                  onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, altText: e.target.value })}
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                {editingGalleryItem.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteGallery(editingGalleryItem.id!, editingGalleryItem.title)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Photo</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingGalleryItem(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow"
                  >
                    Save Photo
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION DIALOG MODAL (Iframe & In-App Safe)
         ========================================================================= */}
      {deleteConfirmState?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-emerald-100 animate-scaleUp">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-bold text-emerald-950">
                  {deleteConfirmState.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {deleteConfirmState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setDeleteConfirmState(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={async () => {
                  setIsDeletingItem(true);
                  try {
                    await deleteConfirmState.onConfirm();
                  } finally {
                    setIsDeletingItem(false);
                    setDeleteConfirmState(null);
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5"
              >
                {isDeletingItem ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>{deleteConfirmState.confirmLabel || 'Confirm Delete'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
