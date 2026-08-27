import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, Booking, Enquiry, Room, SpaService, Facility, GalleryItem } from './db.js';
import { generateAuthToken, requireAdminAuth, AuthenticatedRequest } from './auth.js';

export const apiRouter = express.Router();

// -------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------

// Website Settings
apiRouter.get('/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rooms List
apiRouter.get('/rooms', (req: Request, res: Response) => {
  try {
    const rooms = db.getAllRooms(true);
    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single Room Detail
apiRouter.get('/rooms/:id', (req: Request, res: Response) => {
  try {
    const room = db.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Spa & Services List
apiRouter.get('/services', (req: Request, res: Response) => {
  try {
    const services = db.getAllServices(true);
    res.json({ success: true, data: services });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Facilities List
apiRouter.get('/facilities', (req: Request, res: Response) => {
  try {
    const facilities = db.getAllFacilities(true);
    res.json({ success: true, data: facilities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Gallery List
apiRouter.get('/gallery', (req: Request, res: Response) => {
  try {
    const gallery = db.getAllGalleryItems();
    res.json({ success: true, data: gallery });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Testimonials List
apiRouter.get('/testimonials', (req: Request, res: Response) => {
  try {
    const testimonials = db.getAllTestimonials(true);
    res.json({ success: true, data: testimonials });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SUBMIT BOOKING REQUEST (with strict validation & safe sanitization)
apiRouter.post('/bookings', (req: Request, res: Response) => {
  try {
    const {
      guestName,
      guestPhone,
      guestEmail,
      checkInDate,
      checkOutDate,
      adults,
      children = 0,
      roomId,
      serviceId,
      specialRequests = '',
      source = 'website',
    } = req.body;

    // Validation
    if (!guestName || typeof guestName !== 'string' || guestName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter a valid guest name (at least 2 characters).' });
    }

    if (!guestPhone || typeof guestPhone !== 'string' || guestPhone.trim().length < 7) {
      return res.status(400).json({ success: false, error: 'Please provide a valid contact phone number.' });
    }

    if (!guestEmail || typeof guestEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ success: false, error: 'Check-in and check-out dates are required.' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date format provided.' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, error: 'Check-out date must be after check-in date.' });
    }

    const parsedAdults = parseInt(adults, 10);
    const parsedChildren = parseInt(children, 10) || 0;

    if (isNaN(parsedAdults) || parsedAdults < 1) {
      return res.status(400).json({ success: false, error: 'At least 1 adult guest is required.' });
    }

    // Resolve room details
    let roomName = 'Standard Villa / Room';
    let pricePerNight = 0;
    if (roomId) {
      const room = db.getRoomById(roomId);
      if (room) {
        roomName = room.name;
        pricePerNight = room.pricePerNight;
      }
    }

    // Resolve service details
    let serviceName = '';
    let servicePrice = 0;
    if (serviceId) {
      const service = db.getServiceById(serviceId);
      if (service) {
        serviceName = service.name;
        servicePrice = service.price || 0;
      }
    }

    // Calculate nights & estimated amount
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = (pricePerNight > 0 ? pricePerNight * nights : 0) + servicePrice;

    const newBooking = db.createBooking({
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim(),
      checkInDate,
      checkOutDate,
      adults: parsedAdults,
      children: parsedChildren,
      roomId: roomId || 'general',
      roomName,
      serviceId: serviceId || undefined,
      serviceName: serviceName || undefined,
      specialRequests: specialRequests ? String(specialRequests).trim() : '',
      totalAmount: totalAmount > 0 ? totalAmount : undefined,
      status: 'new',
      source,
    });

    res.status(201).json({
      success: true,
      message: 'Your booking enquiry has been received successfully.',
      data: newBooking,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'An error occurred processing your booking request.' });
  }
});

// SUBMIT CONTACT ENQUIRY
apiRouter.post('/enquiries', (req: Request, res: Response) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter your name.' });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return res.status(400).json({ success: false, error: 'Please provide a valid contact number.' });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please enter your enquiry message.' });
    }

    const newEnquiry = db.createEnquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      subject: subject ? String(subject).trim() : 'General Enquiry',
      message: message.trim(),
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent to our concierge team.',
      data: {
        id: newEnquiry.id,
        name: newEnquiry.name,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username/email and password are required.' });
    }

    const user = db.getAdminByUsername(username.trim());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const token = generateAuthToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/auth/verify', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const user = db.getAdminById(req.user.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// -------------------------------------------------------------
// ADMIN PROTECTED ENDPOINTS
// -------------------------------------------------------------

// Dashboard Stats
apiRouter.get('/admin/stats', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// BOOKINGS MANAGEMENT
apiRouter.get('/admin/bookings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    let list = db.getAllBookings();

    if (status && status !== 'all') {
      list = list.filter((b) => b.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.guestPhone.toLowerCase().includes(q) ||
          b.guestEmail.toLowerCase().includes(q) ||
          b.bookingRef.toLowerCase().includes(q) ||
          b.roomName.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/bookings/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CRITICAL REQUIREMENT: Owner can EDIT submitted booking details!
apiRouter.put('/admin/bookings/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate if changing dates
    if (updates.checkInDate && updates.checkOutDate) {
      const inDate = new Date(updates.checkInDate);
      const outDate = new Date(updates.checkOutDate);
      if (outDate <= inDate) {
        return res.status(400).json({ success: false, error: 'Check-out date must be strictly after check-in date.' });
      }
    }

    const updated = db.updateBooking(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    res.json({ success: true, data: updated, message: 'Booking details updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/bookings/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteBooking(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Booking record not found' });
    }
    res.json({ success: true, message: 'Booking deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ENQUIRIES MANAGEMENT
apiRouter.get('/admin/enquiries', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    let list = db.getAllEnquiries();

    if (status && status !== 'all') {
      list = list.filter((e) => e.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.message.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateEnquiry(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    res.json({ success: true, data: updated, message: 'Enquiry updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteEnquiry(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ROOM MANAGEMENT (CRUD)
apiRouter.get('/admin/rooms', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const rooms = db.getAllRooms(false);
    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/rooms', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, tagline, description, pricePerNight, capacityAdults, capacityChildren, bedType, sizeSqFt, featuredImage, galleryImages, amenities, isAvailable, isActive } = req.body;

    if (!name || !pricePerNight) {
      return res.status(400).json({ success: false, error: 'Room name and price are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newRoom = db.createRoom({
      name: name.trim(),
      hindiName: req.body.hindiName || '',
      slug: slug || `room-${Date.now()}`,
      tagline: tagline || '',
      description: description || '',
      pricePerNight: Number(pricePerNight) || 0,
      capacityAdults: Number(capacityAdults) || 2,
      capacityChildren: Number(capacityChildren) || 0,
      bedType: bedType || '1 King Bed',
      sizeSqFt: Number(sizeSqFt) || 450,
      featuredImage: featuredImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [featuredImage || ''],
      amenities: Array.isArray(amenities) ? amenities : ['Wi-Fi', 'Balcony', 'En-suite Bath'],
      isAvailable: isAvailable !== false,
      isActive: isActive !== false,
      order: db.getAllRooms(false).length + 1,
    });

    res.status(201).json({ success: true, data: newRoom, message: 'Room created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/rooms/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateRoom(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, data: updated, message: 'Room updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/rooms/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteRoom(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, message: 'Room deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SPA & SERVICE MANAGEMENT (CRUD)
apiRouter.get('/admin/services', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const services = db.getAllServices(false);
    res.json({ success: true, data: services });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/services', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, durationMinutes, price, description, benefits, featuredImage, isActive } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Service name and price are required.' });
    }

    const newService = db.createService({
      name: name.trim(),
      hindiName: req.body.hindiName || '',
      category: category || 'Ayurveda',
      durationMinutes: Number(durationMinutes) || 60,
      price: Number(price) || 0,
      description: description || '',
      benefits: Array.isArray(benefits) ? benefits : [],
      featuredImage: featuredImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
      isActive: isActive !== false,
      order: db.getAllServices(false).length + 1,
    });

    res.status(201).json({ success: true, data: newService, message: 'Spa service created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/services/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateService(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, data: updated, message: 'Service updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/services/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteService(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// FACILITIES CRUD
apiRouter.post('/admin/facilities', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, iconName, description, image, isActive } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Facility name is required.' });

    const newFac = db.createFacility({
      name: name.trim(),
      hindiName: req.body.hindiName || '',
      iconName: iconName || 'Sparkles',
      description: description || '',
      image: image || '',
      isActive: isActive !== false,
      order: db.getAllFacilities(false).length + 1,
    });

    res.status(201).json({ success: true, data: newFac });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/facilities/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateFacility(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Facility not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/facilities/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteFacility(req.params.id);
    if (!success) return res.status(404).json({ success: false, error: 'Facility not found' });
    res.json({ success: true, message: 'Facility deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GALLERY CRUD
apiRouter.post('/admin/gallery', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, imageUrl, caption, altText } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'Image URL is required.' });
    }

    const newItem = db.createGalleryItem({
      title: title || 'Retreat View',
      category: category || 'property',
      imageUrl: imageUrl.trim(),
      caption: caption || '',
      altText: altText || 'Bahar Retreat And Spa',
      order: db.getAllGalleryItems().length + 1,
    });

    res.status(201).json({ success: true, data: newItem, message: 'Gallery item added successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/gallery/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateGalleryItem(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }
    res.json({ success: true, data: updated, message: 'Gallery item updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/gallery/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteGalleryItem(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }
    res.json({ success: true, message: 'Gallery item deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SETTINGS MANAGEMENT
apiRouter.put('/admin/settings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, data: updated, message: 'Website settings updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CHANGE ADMIN PASSWORD
apiRouter.put('/admin/change-password', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const user = db.getAdminById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current password does not match.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);
    db.updateAdminPassword(user.id, newHash);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
