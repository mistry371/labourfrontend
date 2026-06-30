// ─── Enums ────────────────────────────────────────────────────────────────────
export type UserRole = 'customer' | 'worker' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'blocked' | 'pending_verification';
export type WorkerStatus = 'pending_kyc' | 'kyc_submitted' | 'approved' | 'rejected' | 'suspended';
export type OnlineStatus = 'online' | 'offline' | 'busy';
export type ServiceType = 'physical' | 'it';
export type ServiceMode = 'onsite' | 'remote' | 'hybrid';
export type ItUrgency = 'low' | 'normal' | 'high' | 'critical';
export type JobStatus =
  | 'draft' | 'pending' | 'matching' | 'assigned'
  | 'worker_enroute' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  // IT diagnostic flow
  | 'awaiting_diagnosis' | 'diagnosis_submitted'
  | 'awaiting_price_approval' | 'price_approved' | 'price_rejected';
export type PaymentStatus =
  | 'initiated' | 'pending' | 'captured' | 'escrow_held'
  | 'released' | 'refunded' | 'failed' | 'disputed';
export type ReviewType = 'customer_to_worker' | 'worker_to_customer';
export type NotificationType =
  | 'job_assigned' | 'job_accepted' | 'job_rejected' | 'job_started'
  | 'job_completed' | 'job_cancelled' | 'payment_received' | 'payment_released'
  | 'withdrawal_processed' | 'kyc_approved' | 'kyc_rejected' | 'review_received' | 'system';

// ─── Models ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface WorkerSkill {
  id: string;
  workerId: string;
  categoryId: string;
  subcategoryId?: string;
  categoryName: string;
  subcategoryName?: string;
  skillRating: number;
  jobsCompletedInSkill: number;
  deviceTypes?: string[];
  brands?: string[];
}

export interface Worker {
  id: string;
  userId: string;
  user: User;
  status: WorkerStatus;
  onlineStatus: OnlineStatus;
  aadhaarNumber?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  panNumber?: string;
  panCardUrl?: string;
  selfieUrl?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountName?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  averageRating: number;
  totalJobsCompleted: number;
  acceptanceRate: number;
  completionRate: number;
  rejectionReason?: string;
  skills: WorkerSkill[];
  // IT fields
  remoteCapable: boolean;
  deviceExpertise?: string[];
  itCertifications?: string[];
  createdAt: string;
}

export interface JobAssignment {
  id: string;
  jobId: string;
  workerId: string;
  worker: Worker;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'active' | 'completed';
  respondedAt?: string;
  expiresAt?: string;
  distanceKm?: number;
}

export interface Job {
  id: string;
  customerId: string;
  customer: User;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  serviceId?: string;
  serviceName?: string;
  serviceType: ServiceType;
  serviceMode: ServiceMode;
  status: JobStatus;
  estimatedPrice: number;
  finalPrice?: number;
  platformFee?: number;
  workerEarnings?: number;
  // IT pricing breakdown
  diagnosticFee?: number;
  repairCost?: number;
  partsCost?: number;
  jobAddress: string;
  jobLatitude: number;
  jobLongitude: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  startOtp?: string;
  mediaUrls?: string[];
  proofUrls?: string[];
  // IT-specific
  itAttributes?: ItAttributes;
  diagnosticReport?: DiagnosticReport;
  priceApprovedAt?: string;
  priceRejectedAt?: string;
  priceRejectionReason?: string;
  assignments: JobAssignment[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface ItAttributes {
  deviceType?: string;
  brand?: string;
  model?: string;
  issueType?: string;
  issueDescription?: string;
  urgency?: ItUrgency;
  serialNumber?: string;
  purchaseYear?: number;
  warrantyStatus?: 'in_warranty' | 'out_of_warranty' | 'unknown';
  remoteAccessAvailable?: boolean;
  preferredTime?: string;
}

export interface DiagnosticPart {
  name: string;
  estimatedCost: number;
}

export interface DiagnosticReport {
  rootCause: string;
  recommendedAction: string;
  partsRequired: DiagnosticPart[];
  laborCost: number;
  diagnosticFee: number;
  totalEstimate: number;
  canBeRemote: boolean;
  estimatedDurationHours: number;
  notes?: string;
  submittedAt: string;
}

export interface Payment {
  id: string;
  jobId: string;
  customerId: string;
  amount: number;
  platformFee: number;
  workerAmount: number;
  status: PaymentStatus;
  method: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  escrowReleasedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  status: string;
}

export interface WalletLog {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  type: ReviewType;
  rating: number;
  comment?: string;
  tags?: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt?: string;
  referenceId?: string;
  referenceType?: string;
  data?: Record<string, any>;
  createdAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Service Categories ───────────────────────────────────────────────────────
export interface FormField {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

export type CatalogLevel = 'CATEGORY' | 'DEVICE' | 'SERVICE_TYPE' | 'PROBLEM';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string;
  isActive: boolean;
  description: string;
  pricingModel: string;
  basePrice: number;
  minPrice: number;
  maxPrice?: number;
  priceUnit?: string;
  estimatedDuration?: string;
  requiredWorkerSkills?: string[];
  requiredTools?: string[];
  emergencyServiceAvailable?: boolean;
  homeVisitAvailable?: boolean;
  serviceType?: ServiceType;
  supportedModes?: ServiceMode[];
  children?: ServiceCategory[];
  formSchema: FormField[];
}

export const SERVICE_CATEGORIES: any[] = [
  {
    id: 'computer-laptop-services', name: 'Computer & Laptop Services', icon: '💻', description: 'Laptop Repair, Desktop Repair, All-in-One PC Repair...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'computer-laptop-services-laptop-repair', name: 'Laptop Repair' },
      { id: 'computer-laptop-services-desktop-repair', name: 'Desktop Repair' },
      { id: 'computer-laptop-services-all-in-one-pc-repair', name: 'All-in-One PC Repair' },
      { id: 'computer-laptop-services-gaming-pc-repair', name: 'Gaming PC Repair' },
      { id: 'computer-laptop-services-custom-pc-assembly', name: 'Custom PC Assembly' },
      { id: 'computer-laptop-services-motherboard-repair', name: 'Motherboard Repair' },
      { id: 'computer-laptop-services-ram-upgrade', name: 'RAM Upgrade' },
      { id: 'computer-laptop-services-ssd-upgrade', name: 'SSD Upgrade' },
      { id: 'computer-laptop-services-hdd-replacement', name: 'HDD Replacement' },
      { id: 'computer-laptop-services-graphics-card-installation', name: 'Graphics Card Installation' },
      { id: 'computer-laptop-services-smps-replacement', name: 'SMPS Replacement' },
      { id: 'computer-laptop-services-cooling-fan-replacement', name: 'Cooling Fan Replacement' },
      { id: 'computer-laptop-services-thermal-paste-replacement', name: 'Thermal Paste Replacement' },
      { id: 'computer-laptop-services-bios-update', name: 'BIOS Update' },
      { id: 'computer-laptop-services-cmos-battery-replacement', name: 'CMOS Battery Replacement' },
      { id: 'computer-laptop-services-keyboard-replacement', name: 'Keyboard Replacement' },
      { id: 'computer-laptop-services-touchpad-repair', name: 'Touchpad Repair' },
      { id: 'computer-laptop-services-laptop-screen-replacement', name: 'Laptop Screen Replacement' },
      { id: 'computer-laptop-services-laptop-hinge-repair', name: 'Laptop Hinge Repair' },
      { id: 'computer-laptop-services-laptop-body-repair', name: 'Laptop Body Repair' },
      { id: 'computer-laptop-services-battery-replacement', name: 'Battery Replacement' },
      { id: 'computer-laptop-services-charger-repair', name: 'Charger Repair' },
      { id: 'computer-laptop-services-data-recovery', name: 'Data Recovery' },
      { id: 'computer-laptop-services-data-backup-migration', name: 'Data Backup & Migration' },
      { id: 'computer-laptop-services-os-installation-windows-linux-macos', name: 'OS Installation (Windows/Linux/macOS)' },
      { id: 'computer-laptop-services-driver-installation', name: 'Driver Installation' },
      { id: 'computer-laptop-services-software-installation', name: 'Software Installation' },
      { id: 'computer-laptop-services-virus-malware-removal', name: 'Virus & Malware Removal' },
      { id: 'computer-laptop-services-performance-optimization', name: 'Performance Optimization' },
      { id: 'computer-laptop-services-blue-screen-error-fix', name: 'Blue Screen Error Fix' },
      { id: 'computer-laptop-services-boot-issue-repair', name: 'Boot Issue Repair' },
    ],
  },
  {
    id: 'printer-services', name: 'Printer Services', icon: '🖨️', description: 'Inkjet Printer Repair, Laser Printer Repair, Dot Matrix Printer Repair...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'printer-services-inkjet-printer-repair', name: 'Inkjet Printer Repair' },
      { id: 'printer-services-laser-printer-repair', name: 'Laser Printer Repair' },
      { id: 'printer-services-dot-matrix-printer-repair', name: 'Dot Matrix Printer Repair' },
      { id: 'printer-services-printer-installation', name: 'Printer Installation' },
      { id: 'printer-services-printer-driver-installation', name: 'Printer Driver Installation' },
      { id: 'printer-services-cartridge-refilling', name: 'Cartridge Refilling' },
      { id: 'printer-services-cartridge-replacement', name: 'Cartridge Replacement' },
      { id: 'printer-services-toner-replacement', name: 'Toner Replacement' },
      { id: 'printer-services-paper-jam-fix', name: 'Paper Jam Fix' },
      { id: 'printer-services-wi-fi-printer-setup', name: 'Wi-Fi Printer Setup' },
      { id: 'printer-services-network-printer-configuration', name: 'Network Printer Configuration' },
      { id: 'printer-services-printer-amc', name: 'Printer AMC' },
    ],
  },
  {
    id: 'networking-services', name: 'Networking Services', icon: '🌐', description: 'Wi-Fi Installation, Router Installation, Router Configuration...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'networking-services-wi-fi-installation', name: 'Wi-Fi Installation' },
      { id: 'networking-services-router-installation', name: 'Router Installation' },
      { id: 'networking-services-router-configuration', name: 'Router Configuration' },
      { id: 'networking-services-modem-setup', name: 'Modem Setup' },
      { id: 'networking-services-lan-cable-installation', name: 'LAN Cable Installation' },
      { id: 'networking-services-network-troubleshooting', name: 'Network Troubleshooting' },
      { id: 'networking-services-switch-installation', name: 'Switch Installation' },
      { id: 'networking-services-managed-switch-configuration', name: 'Managed Switch Configuration' },
      { id: 'networking-services-access-point-installation', name: 'Access Point Installation' },
      { id: 'networking-services-mesh-wi-fi-setup', name: 'Mesh Wi-Fi Setup' },
      { id: 'networking-services-firewall-installation', name: 'Firewall Installation' },
      { id: 'networking-services-vpn-setup', name: 'VPN Setup' },
      { id: 'networking-services-office-network-setup', name: 'Office Network Setup' },
      { id: 'networking-services-home-network-setup', name: 'Home Network Setup' },
      { id: 'networking-services-network-rack-installation', name: 'Network Rack Installation' },
      { id: 'networking-services-structured-cabling', name: 'Structured Cabling' },
    ],
  },
  {
    id: 'cctv-security', name: 'CCTV & Security', icon: '📹', description: 'CCTV Installation, CCTV Repair, CCTV Maintenance...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'cctv-security-cctv-installation', name: 'CCTV Installation' },
      { id: 'cctv-security-cctv-repair', name: 'CCTV Repair' },
      { id: 'cctv-security-cctv-maintenance', name: 'CCTV Maintenance' },
      { id: 'cctv-security-dvr-installation', name: 'DVR Installation' },
      { id: 'cctv-security-nvr-installation', name: 'NVR Installation' },
      { id: 'cctv-security-camera-replacement', name: 'Camera Replacement' },
      { id: 'cctv-security-ip-camera-configuration', name: 'IP Camera Configuration' },
      { id: 'cctv-security-remote-viewing-setup', name: 'Remote Viewing Setup' },
      { id: 'cctv-security-cctv-amc', name: 'CCTV AMC' },
      { id: 'cctv-security-biometric-attendance-machine-installation', name: 'Biometric Attendance Machine Installation' },
      { id: 'cctv-security-access-control-system', name: 'Access Control System' },
      { id: 'cctv-security-video-door-phone-installation', name: 'Video Door Phone Installation' },
    ],
  },
  {
    id: 'server-cloud', name: 'Server & Cloud', icon: '☁️', description: 'Server Installation, Windows Server Setup, Linux Server Setup...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'server-cloud-server-installation', name: 'Server Installation' },
      { id: 'server-cloud-windows-server-setup', name: 'Windows Server Setup' },
      { id: 'server-cloud-linux-server-setup', name: 'Linux Server Setup' },
      { id: 'server-cloud-nas-installation', name: 'NAS Installation' },
      { id: 'server-cloud-storage-configuration', name: 'Storage Configuration' },
      { id: 'server-cloud-active-directory-setup', name: 'Active Directory Setup' },
      { id: 'server-cloud-file-server-setup', name: 'File Server Setup' },
      { id: 'server-cloud-backup-server-setup', name: 'Backup Server Setup' },
      { id: 'server-cloud-virtualization-vmware-hyper-v', name: 'Virtualization (VMware/Hyper-V)' },
      { id: 'server-cloud-cloud-migration', name: 'Cloud Migration' },
      { id: 'server-cloud-microsoft-365-setup', name: 'Microsoft 365 Setup' },
      { id: 'server-cloud-google-workspace-setup', name: 'Google Workspace Setup' },
    ],
  },
  {
    id: 'email-business-it', name: 'Email & Business IT', icon: '📧', description: 'Business Email Setup, Outlook Configuration, Microsoft 365 Configuration...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'email-business-it-business-email-setup', name: 'Business Email Setup' },
      { id: 'email-business-it-outlook-configuration', name: 'Outlook Configuration' },
      { id: 'email-business-it-microsoft-365-configuration', name: 'Microsoft 365 Configuration' },
      { id: 'email-business-it-google-workspace-configuration', name: 'Google Workspace Configuration' },
      { id: 'email-business-it-domain-configuration', name: 'Domain Configuration' },
      { id: 'email-business-it-dns-management', name: 'DNS Management' },
      { id: 'email-business-it-ssl-installation', name: 'SSL Installation' },
    ],
  },
  {
    id: 'smart-devices', name: 'Smart Devices', icon: '📺', description: 'Smart TV Installation, Smart TV Troubleshooting, Android TV Setup...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'smart-devices-smart-tv-installation', name: 'Smart TV Installation' },
      { id: 'smart-devices-smart-tv-troubleshooting', name: 'Smart TV Troubleshooting' },
      { id: 'smart-devices-android-tv-setup', name: 'Android TV Setup' },
      { id: 'smart-devices-fire-tv-stick-setup', name: 'Fire TV Stick Setup' },
      { id: 'smart-devices-chromecast-setup', name: 'Chromecast Setup' },
      { id: 'smart-devices-projector-installation', name: 'Projector Installation' },
      { id: 'smart-devices-led-display-installation', name: 'LED Display Installation' },
      { id: 'smart-devices-digital-signage-setup', name: 'Digital Signage Setup' },
    ],
  },
  {
    id: 'office-it-infrastructure', name: 'Office IT Infrastructure', icon: '🏢', description: 'Office IT Setup, Office Relocation IT Support, Rack Installation...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'office-it-infrastructure-office-it-setup', name: 'Office IT Setup' },
      { id: 'office-it-infrastructure-office-relocation-it-support', name: 'Office Relocation IT Support' },
      { id: 'office-it-infrastructure-rack-installation', name: 'Rack Installation' },
      { id: 'office-it-infrastructure-cable-management', name: 'Cable Management' },
      { id: 'office-it-infrastructure-conference-room-setup', name: 'Conference Room Setup' },
      { id: 'office-it-infrastructure-video-conferencing-setup', name: 'Video Conferencing Setup' },
      { id: 'office-it-infrastructure-intercom-installation', name: 'Intercom Installation' },
      { id: 'office-it-infrastructure-attendance-system-setup', name: 'Attendance System Setup' },
      { id: 'office-it-infrastructure-pos-machine-installation', name: 'POS Machine Installation' },
      { id: 'office-it-infrastructure-barcode-scanner-installation', name: 'Barcode Scanner Installation' },
    ],
  },
  {
    id: 'cyber-security', name: 'Cyber Security', icon: '🔒', description: 'Antivirus Installation, Firewall Configuration, Security Audit...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'cyber-security-antivirus-installation', name: 'Antivirus Installation' },
      { id: 'cyber-security-firewall-configuration', name: 'Firewall Configuration' },
      { id: 'cyber-security-security-audit', name: 'Security Audit' },
      { id: 'cyber-security-data-backup', name: 'Data Backup' },
      { id: 'cyber-security-ransomware-recovery', name: 'Ransomware Recovery' },
      { id: 'cyber-security-password-recovery', name: 'Password Recovery' },
      { id: 'cyber-security-endpoint-protection', name: 'Endpoint Protection' },
      { id: 'cyber-security-email-security', name: 'Email Security' },
    ],
  },
  {
    id: 'mobile-tablet', name: 'Mobile & Tablet', icon: '📱', description: 'Android Software Installation, iPhone Configuration, Tablet Setup...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'mobile-tablet-android-software-installation', name: 'Android Software Installation' },
      { id: 'mobile-tablet-iphone-configuration', name: 'iPhone Configuration' },
      { id: 'mobile-tablet-tablet-setup', name: 'Tablet Setup' },
      { id: 'mobile-tablet-data-transfer', name: 'Data Transfer' },
      { id: 'mobile-tablet-mobile-backup', name: 'Mobile Backup' },
      { id: 'mobile-tablet-device-configuration', name: 'Device Configuration' },
    ],
  },
  {
    id: 'gaming-entertainment', name: 'Gaming & Entertainment', icon: '🎮', description: 'Gaming PC Assembly, Gaming Console Setup, VR Device Installation...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'gaming-entertainment-gaming-pc-assembly', name: 'Gaming PC Assembly' },
      { id: 'gaming-entertainment-gaming-console-setup', name: 'Gaming Console Setup' },
      { id: 'gaming-entertainment-vr-device-installation', name: 'VR Device Installation' },
      { id: 'gaming-entertainment-rgb-setup', name: 'RGB Setup' },
      { id: 'gaming-entertainment-performance-tuning', name: 'Performance Tuning' },
    ],
  },
  {
    id: 'smart-home', name: 'Smart Home', icon: '🏠', description: 'Smart Door Lock Installation, Smart Lighting Setup, Smart Camera Setup...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'smart-home-smart-door-lock-installation', name: 'Smart Door Lock Installation' },
      { id: 'smart-home-smart-lighting-setup', name: 'Smart Lighting Setup' },
      { id: 'smart-home-smart-camera-setup', name: 'Smart Camera Setup' },
      { id: 'smart-home-smart-doorbell-installation', name: 'Smart Doorbell Installation' },
      { id: 'smart-home-alexa-setup', name: 'Alexa Setup' },
      { id: 'smart-home-google-home-setup', name: 'Google Home Setup' },
      { id: 'smart-home-smart-switch-installation', name: 'Smart Switch Installation' },
    ],
  },
  {
    id: 'corporate-enterprise', name: 'Corporate & Enterprise', icon: '🏭', description: 'Annual Maintenance Contract (AMC), On-Site IT Support, Resident IT Engineer...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'corporate-enterprise-annual-maintenance-contract-amc', name: 'Annual Maintenance Contract (AMC)' },
      { id: 'corporate-enterprise-on-site-it-support', name: 'On-Site IT Support' },
      { id: 'corporate-enterprise-resident-it-engineer', name: 'Resident IT Engineer' },
      { id: 'corporate-enterprise-it-asset-audit', name: 'IT Asset Audit' },
      { id: 'corporate-enterprise-it-infrastructure-audit', name: 'IT Infrastructure Audit' },
      { id: 'corporate-enterprise-network-health-check', name: 'Network Health Check' },
      { id: 'corporate-enterprise-preventive-maintenance', name: 'Preventive Maintenance' },
      { id: 'corporate-enterprise-corporate-helpdesk-support', name: 'Corporate Helpdesk Support' },
    ],
  },
  {
    id: 'installation-services', name: 'Installation Services', icon: '📦', description: 'Software Installation, Hardware Installation, Driver Installation...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'installation-services-software-installation', name: 'Software Installation' },
      { id: 'installation-services-hardware-installation', name: 'Hardware Installation' },
      { id: 'installation-services-driver-installation', name: 'Driver Installation' },
      { id: 'installation-services-device-configuration', name: 'Device Configuration' },
      { id: 'installation-services-peripheral-installation', name: 'Peripheral Installation' },
      { id: 'installation-services-scanner-installation', name: 'Scanner Installation' },
      { id: 'installation-services-ups-installation', name: 'UPS Installation' },
      { id: 'installation-services-inverter-it-integration', name: 'Inverter IT Integration' },
    ],
  },
  {
    id: 'maintenance-services', name: 'Maintenance Services', icon: '🔧', description: 'Preventive Maintenance, Corrective Maintenance, Emergency IT Support...',
    basePrice: 500, serviceType: 'it', supportedModes: ['onsite', 'remote', 'hybrid'],
    children: [
      { id: 'maintenance-services-preventive-maintenance', name: 'Preventive Maintenance' },
      { id: 'maintenance-services-corrective-maintenance', name: 'Corrective Maintenance' },
      { id: 'maintenance-services-emergency-it-support', name: 'Emergency IT Support' },
      { id: 'maintenance-services-remote-support', name: 'Remote Support' },
      { id: 'maintenance-services-scheduled-maintenance', name: 'Scheduled Maintenance' },
      { id: 'maintenance-services-health-check', name: 'Health Check' },
      { id: 'maintenance-services-system-cleaning', name: 'System Cleaning' },
      { id: 'maintenance-services-performance-optimization', name: 'Performance Optimization' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  pending: 'Finding Worker',
  matching: 'Matching',
  assigned: 'Worker Assigned',
  worker_enroute: 'Worker En Route',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  // IT diagnostic flow
  awaiting_diagnosis: 'Awaiting Diagnosis',
  diagnosis_submitted: 'Diagnosis Submitted',
  awaiting_price_approval: 'Approve Quote',
  price_approved: 'Quote Approved',
  price_rejected: 'Quote Rejected',
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-700',
  matching: 'bg-blue-100 text-blue-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  worker_enroute: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  disputed: 'bg-red-200 text-red-800',
  // IT diagnostic flow
  awaiting_diagnosis: 'bg-cyan-100 text-cyan-700',
  diagnosis_submitted: 'bg-teal-100 text-teal-700',
  awaiting_price_approval: 'bg-amber-100 text-amber-700',
  price_approved: 'bg-green-100 text-green-700',
  price_rejected: 'bg-red-100 text-red-700',
};

// ─── Global browser augmentations ────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: Record<string, any>) => {
      open(): void;
      on(event: string, handler: (data: any) => void): void;
    };
  }
}
