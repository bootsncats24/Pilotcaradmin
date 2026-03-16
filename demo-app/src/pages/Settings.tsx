/// <reference types="../types/electron" />
import React, { useState, useEffect, useRef } from 'react';
import { Settings } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import * as authService from '../services/auth';
import { validatePasswordComplexity } from '../shared/passwordValidation';

// Regex pattern for special characters (defined outside component to avoid JSX parsing issues)
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/;

// Interactive Invoice Logo Preview Component
interface InvoiceLogoPreviewProps {
  logoPreview: string;
  logoWidth: number;
  logoHeight: number;
  companyName: string;
  onSizeChange: (width: number, height: number) => void;
}

const InvoiceLogoPreview: React.FC<InvoiceLogoPreviewProps> = ({
  logoPreview,
  logoWidth,
  logoHeight,
  companyName,
  onSizeChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const handleRef = useRef<HTMLDivElement>(null);
  
  // Calculate accurate scale based on actual PDF dimensions
  // PDF: A4 page = 210mm × 297mm, margin = 20mm, usable width = 170mm
  // jsPDF uses millimeters (mm) as the unit, so logoWidth/logoHeight are in mm
  // Preview container: maxWidth = 800px (from CSS)
  // Convert mm to pixels: 1mm ≈ 3.779527559 pixels at 96 DPI
  const pdfPageWidth = 210; // mm (A4 width)
  const pdfMargin = 20; // mm
  const pdfUsableWidth = pdfPageWidth - (pdfMargin * 2); // 170mm
  const previewContainerWidth = 800; // px (matches maxWidth in CSS)
  const mmToPx = 3.779527559; // 1mm in pixels at 96 DPI
  const pdfUsableWidthPx = pdfUsableWidth * mmToPx; // ~642px
  const previewScale = previewContainerWidth / pdfUsableWidthPx; // ~1.246 (slightly larger for better visibility)
  
  // Note: logoWidth and logoHeight are stored in millimeters (mm) as used by jsPDF

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width: logoWidth,
      height: logoHeight,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Convert pixel movement to mm (logo dimensions are in mm)
      // deltaX/Y are in pixels, need to convert to mm for PDF
      const deltaXmm = (e.clientX - dragStart.x) / (previewScale * mmToPx);
      const deltaYmm = (e.clientY - dragStart.y) / (previewScale * mmToPx);

      // Calculate new size in mm - allow independent width/height adjustment
      // Reasonable limits: 20mm to 100mm (about 0.8" to 4")
      let newWidth = Math.max(20, Math.min(100, dragStart.width + deltaXmm));
      let newHeight = Math.max(20, Math.min(100, dragStart.height + deltaYmm));

      onSizeChange(Math.round(newWidth), Math.round(newHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, onSizeChange]);

  // Convert PDF mm dimensions to preview pixels for accurate representation
  // logoWidth/logoHeight are in mm, convert to pixels then apply preview scale
  const pdfMarginPx = pdfMargin * mmToPx * previewScale;
  const logoWidthPx = logoWidth * mmToPx * previewScale;
  const logoHeightPx = logoHeight * mmToPx * previewScale;
  
  // Calculate preview dimensions to match PDF aspect ratio
  const previewWidth = previewContainerWidth;
  const previewHeight = (297 * mmToPx * previewScale); // A4 height scaled

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '2rem',
      backgroundColor: 'white',
      position: 'relative',
      maxWidth: `${previewWidth}px`,
      marginTop: '1rem',
    }}>
      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        Invoice Preview - Drag the logo corners to resize (Scale: 1:1 with actual invoice)
      </div>
      
      {/* Mock Invoice Header - Matches actual PDF layout */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '2rem', 
        position: 'relative', 
        alignItems: 'flex-start',
        paddingLeft: `${pdfMarginPx}px`,
        paddingRight: `${pdfMarginPx}px`,
        minHeight: `${logoHeightPx + 20}px`, // Match logo area height
      }}>
        {/* Logo with resize handle - positioned like in PDF */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            border: isDragging ? '2px dashed #1976D2' : '2px solid transparent',
            borderRadius: '4px',
            padding: '4px',
            transition: isDragging ? 'none' : 'border 0.2s',
            marginTop: '0', // Logo starts at top margin in PDF
          }}
        >
          <img
            src={logoPreview}
            alt="Logo"
            style={{
              width: `${logoWidthPx}px`,
              height: `${logoHeightPx}px`,
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            draggable={false}
          />
          {/* Resize handle - bottom right corner */}
          <div
            ref={handleRef}
            onMouseDown={handleMouseDown}
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              width: '20px',
              height: '20px',
              backgroundColor: '#1976D2',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Drag to resize logo"
          >
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'white',
              borderRadius: '2px',
              transform: 'rotate(45deg)',
            }} />
          </div>
        </div>

        {/* Invoice header (right side) - matches PDF positioning */}
        <div style={{ 
          textAlign: 'right',
          marginTop: '10px', // Matches PDF headerY offset
        }}>
          <div style={{ 
            fontSize: `${24 * previewScale}px`, 
            fontWeight: 'bold', 
            color: '#667eea', 
            marginBottom: '0.5rem',
            lineHeight: '1.2',
          }}>
            INVOICE
          </div>
          <div style={{ 
            fontSize: `${11 * previewScale}px`, 
            color: '#666',
            marginBottom: '2px',
          }}>
            Invoice #: INV-0001
          </div>
          <div style={{ 
            fontSize: `${11 * previewScale}px`, 
            color: '#666',
          }}>
            Date: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Company name below logo - matches PDF layout */}
      <div style={{ 
        marginBottom: '1rem',
        paddingLeft: `${pdfMarginPx}px`,
        paddingRight: `${pdfMarginPx}px`,
      }}>
        <div style={{ 
          fontSize: `${13 * previewScale}px`, 
          fontWeight: 'bold', 
          color: '#333', 
          marginBottom: '0.5rem',
          marginTop: `${15 * previewScale}px`, // Space below logo
        }}>
          {companyName || 'Your Company Name'}
        </div>
        <div style={{ 
          fontSize: `${11 * previewScale}px`, 
          color: '#666',
          marginBottom: '2px',
        }}>
          123 Main St, City, State 12345
        </div>
        <div style={{ 
          fontSize: `${11 * previewScale}px`, 
          color: '#666',
        }}>
          Phone: (555) 123-4567
        </div>
      </div>

      {/* Size display with conversion info */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '0.85rem',
        color: '#666',
      }}>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Current size:</strong> {logoWidth}mm × {logoHeight}mm (PDF dimensions)
        </div>
        <div style={{ fontSize: '0.75rem', color: '#888' }}>
          Preview scale: {previewScale.toFixed(3)}x | 
          Preview size: {logoWidthPx.toFixed(1)}px × {logoHeightPx.toFixed(1)}px
        </div>
      </div>
    </div>
  );
};

interface BackupFileInfo {
  name: string;
  path: string;
  date: string;
  size: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    mile_rate: 0,
    mini_run_rate: 0,
    day_rate: 0,
    hourly_rate: 0,
    chase_pole_base_rate: 0,
    overnight_rate: 0,
    default_tax_rate: 0,
  });
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({
    mile_rate: '0',
    mini_run_rate: '0',
    day_rate: '0',
    hourly_rate: '0',
    chase_pole_base_rate: '0',
    overnight_rate: '0',
  });
  const [lockTimeout, setLockTimeout] = useState<number>(authService.getLockTimeout());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [backupStatus, setBackupStatus] = useState<string>('');
  const [backupFiles, setBackupFiles] = useState<BackupFileInfo[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadBackupFiles();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await MockDataService.getSettings();
      setSettings(data);
      setRateInputs({
        mile_rate: String(data.mile_rate || 0),
        mini_run_rate: String(data.mini_run_rate || 0),
        day_rate: String(data.day_rate || 0),
        hourly_rate: String(data.hourly_rate || 0),
        chase_pole_base_rate: String(data.chase_pole_base_rate || 0),
        overnight_rate: String(data.overnight_rate || 0),
      });
      // Set logo preview if logo exists
      if (data.company_logo) {
        // Detect image format from base64
        const mimeType = data.company_logo.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
        setLogoPreview(`data:${mimeType};base64,${data.company_logo}`);
      } else {
        setLogoPreview(null);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Don't show alert, just log the error
    } finally {
      setLoading(false);
    }
  };

  const loadBackupFiles = async () => {
    try {
      setLoadingBackups(true);
      const files = await window.electronAPI.getBackupFiles();
      setBackupFiles(files);
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleChange = async (field: keyof Settings, value: number | string | boolean | null) => {
    setSettings((prev: Settings) => {
      const updated = { ...prev };
      (updated as any)[field] = value;
      
      // Auto-save logo size changes immediately (no need to click save button)
      if (field === 'logo_width' || field === 'logo_height') {
        // Save immediately with the updated value
        MockDataService.updateSettings({ ...updated, [field]: value }).catch(error => {
          console.error('Error auto-saving logo size:', error);
        });
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null); // Clear previous message
    try {
      await MockDataService.updateSettings(settings);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      // Auto-clear after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Error saving settings' });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickBackup = async () => {
    try {
      setBackupStatus('Creating backup...');
      const result = await window.electronAPI.backupDatabase();
      setBackupStatus(result.message);
      if (result.success) {
        await loadBackupFiles();
      }
    } catch (error) {
      setBackupStatus(`Backup failed: ${String(error)}`);
    }
  };

  const handleBackupToLocation = async () => {
    try {
      setBackupStatus('Select backup location...');
      const result = await window.electronAPI.backupDatabaseToLocation();
      setBackupStatus(result.message);
    } catch (error) {
      setBackupStatus(`Backup failed: ${String(error)}`);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('This will replace your current data with the selected backup. Continue?')) {
      return;
    }

    try {
      const backupPath = await window.electronAPI.selectBackupFile();
      if (!backupPath) {
        setBackupStatus('Restore cancelled.');
        return;
      }

      setBackupStatus('Restoring backup...');
      await window.electronAPI.restoreDatabase(backupPath);
      setBackupStatus('Database restored successfully. Please restart the app to load restored data.');
    } catch (error) {
      setBackupStatus(`Restore failed: ${String(error)}`);
    }
  };

  const handleOpenBackupsFolder = async () => {
    try {
      await window.electronAPI.openBackupsFolder();
    } catch (error) {
      console.error('Error opening backups folder:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleString();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (PNG, JPG, GIF, or WebP)');
      return;
    }

    // Allow larger files - we'll resize and compress them
    const maxInitialSize = 10 * 1024 * 1024; // 10MB max initial size
    if (file.size > maxInitialSize) {
      alert('File is too large. Please select an image file smaller than 10MB.');
      return;
    }

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        
        // Resize and compress image first (max 200x200px)
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // INCREASED MAX SIZE for better quality - 400px instead of 200px
          const maxSize = 400;
          let width = img.width;
          let height = img.height;

          // Only resize if image is larger than maxSize - preserve original size if smaller
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { alpha: true });
          if (ctx) {
            // Use better image smoothing for quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Clear canvas with transparent background (preserves transparency)
            ctx.clearRect(0, 0, width, height);
            
            // Draw the image with high quality
            ctx.drawImage(img, 0, 0, width, height);
            
            // Check if image has transparency by sampling pixels
            let hasTransparency = false;
            try {
              const imageData = ctx.getImageData(0, 0, Math.min(width, 10), Math.min(height, 10));
              for (let i = 3; i < imageData.data.length; i += 4) {
                if (imageData.data[i] < 255) { // Alpha channel < 255 means transparency
                  hasTransparency = true;
                  break;
                }
              }
            } catch (e) {
              // If we can't check, assume it might have transparency and use PNG
              hasTransparency = true;
            }
            
            let resizedBase64: string;
            let mimeType: string;
            
            // If image has transparency, use PNG to preserve it
            // Otherwise, use JPEG with HIGH QUALITY
            if (hasTransparency) {
              // Use PNG to preserve transparency - NO COMPRESSION
              const pngData = canvas.toDataURL('image/png');
              resizedBase64 = pngData.split('base64,')[1];
              mimeType = 'image/png';
              
              // Check size - only compress if absolutely necessary
              const base64Size = (resizedBase64.length * 3) / 4;
              const maxSizeBytes = 500 * 1024;
              
              if (base64Size > maxSizeBytes) {
                // Only reduce size if way over limit - preserve quality
                const scaleFactor = Math.sqrt(maxSizeBytes / base64Size) * 0.95; // Less aggressive
                const newWidth = Math.floor(width * scaleFactor);
                const newHeight = Math.floor(height * scaleFactor);
                
                const smallCanvas = document.createElement('canvas');
                smallCanvas.width = newWidth;
                smallCanvas.height = newHeight;
                const smallCtx = smallCanvas.getContext('2d', { alpha: true });
                if (smallCtx) {
                  smallCtx.imageSmoothingEnabled = true;
                  smallCtx.imageSmoothingQuality = 'high';
                  smallCtx.clearRect(0, 0, newWidth, newHeight);
                  smallCtx.drawImage(img, 0, 0, newWidth, newHeight);
                  const smallPngData = smallCanvas.toDataURL('image/png');
                  resizedBase64 = smallPngData.split('base64,')[1];
                  mimeType = 'image/png';
                }
              }
            } else {
              // No transparency - use JPEG with HIGH QUALITY (0.95+)
              mimeType = 'image/jpeg';
              let quality = 0.95; // HIGH QUALITY - was 0.85
              
              const jpegData = canvas.toDataURL('image/jpeg', quality);
              resizedBase64 = jpegData.split('base64,')[1];
              
              const base64Size = (resizedBase64.length * 3) / 4;
              const maxSizeBytes = 500 * 1024;
              
              // Only reduce quality if absolutely necessary
              if (base64Size > maxSizeBytes) {
                quality = 0.9; // Still high quality - was 0.7
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resizedBase64 = compressedData.split('base64,')[1];
                const newBase64Size = (resizedBase64.length * 3) / 4;
                
                // Last resort - still use decent quality
                if (newBase64Size > maxSizeBytes) {
                  quality = 0.85; // Minimum acceptable - was 0.5
                  const finalData = canvas.toDataURL('image/jpeg', quality);
                  resizedBase64 = finalData.split('base64,')[1];
                }
              }
            }
            
            handleChange('company_logo', resizedBase64);
            setLogoPreview(`data:${mimeType};base64,${resizedBase64}`);
          }
        };
        img.onerror = () => {
          alert('Error loading image. Please try a different file.');
        };
        img.src = result;
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing logo:', error);
      alert('Error processing logo. Please try again.');
    }
  };

  const handleRemoveLogo = () => {
    handleChange('company_logo', null);
    setLogoPreview(null);
  };

  const handleColorChange = (field: 'invoice_header_color' | 'invoice_title_color', value: string) => {
    // Validate hex color format
    if (value === '' || /^#[0-9A-Fa-f]{6}$/.test(value)) {
      handleChange(field, value || null);
    }
  };

  if (loading) {
    return <div className="card">Loading settings...</div>;
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card">
        <h2>Billing Rates</h2>
        <form onSubmit={handleSubmit} style={{ pointerEvents: 'auto' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Mile Rate ($)</label>
              <input
                type="text"
                value={rateInputs.mile_rate}
                onChange={(e) => {
                  setRateInputs(prev => ({ ...prev, mile_rate: e.target.value }));
                  const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    handleChange('mile_rate', numValue);
                  }
                }}
                onBlur={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (isNaN(numValue) || numValue < 0) {
                    setRateInputs(prev => ({ ...prev, mile_rate: '0' }));
                    handleChange('mile_rate', 0);
                  } else {
                    setRateInputs(prev => ({ ...prev, mile_rate: String(numValue) }));
                  }
                }}
                placeholder="0.00"
                inputMode="decimal"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>

            <div className="form-group">
              <label>Mini Run Rate ($)</label>
              <input
                type="text"
                value={rateInputs.mini_run_rate}
                onChange={(e) => {
                  setRateInputs(prev => ({ ...prev, mini_run_rate: e.target.value }));
                  const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    handleChange('mini_run_rate', numValue);
                  }
                }}
                onBlur={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (isNaN(numValue) || numValue < 0) {
                    setRateInputs(prev => ({ ...prev, mini_run_rate: '0' }));
                    handleChange('mini_run_rate', 0);
                  } else {
                    setRateInputs(prev => ({ ...prev, mini_run_rate: String(numValue) }));
                  }
                }}
                placeholder="0.00"
                inputMode="decimal"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Day Rate ($)</label>
              <input
                type="text"
                value={rateInputs.day_rate}
                onChange={(e) => {
                  setRateInputs(prev => ({ ...prev, day_rate: e.target.value }));
                  const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    handleChange('day_rate', numValue);
                  }
                }}
                onBlur={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (isNaN(numValue) || numValue < 0) {
                    setRateInputs(prev => ({ ...prev, day_rate: '0' }));
                    handleChange('day_rate', 0);
                  } else {
                    setRateInputs(prev => ({ ...prev, day_rate: String(numValue) }));
                  }
                }}
                placeholder="0.00"
                inputMode="decimal"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>

            <div className="form-group">
              <label>Hourly Rate ($)</label>
              <input
                type="text"
                value={rateInputs.hourly_rate}
                onChange={(e) => {
                  setRateInputs(prev => ({ ...prev, hourly_rate: e.target.value }));
                  const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    handleChange('hourly_rate', numValue);
                  }
                }}
                onBlur={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (isNaN(numValue) || numValue < 0) {
                    setRateInputs(prev => ({ ...prev, hourly_rate: '0' }));
                    handleChange('hourly_rate', 0);
                  } else {
                    setRateInputs(prev => ({ ...prev, hourly_rate: String(numValue) }));
                  }
                }}
                placeholder="0.00"
                inputMode="decimal"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Chase/Pole Base Rate ($)</label>
              <input
                type="text"
                value={rateInputs.chase_pole_base_rate}
                onChange={(e) => {
                  setRateInputs(prev => ({ ...prev, chase_pole_base_rate: e.target.value }));
                  const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    handleChange('chase_pole_base_rate', numValue);
                  }
                }}
                onBlur={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (isNaN(numValue) || numValue < 0) {
                    setRateInputs(prev => ({ ...prev, chase_pole_base_rate: '0' }));
                    handleChange('chase_pole_base_rate', 0);
                  } else {
                    setRateInputs(prev => ({ ...prev, chase_pole_base_rate: String(numValue) }));
                  }
                }}
                placeholder="0.00"
                inputMode="decimal"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>

            <div className="form-group">
              <label>Overnight Rate ($)</label>
              <input
                type="text"
                value={rateInputs.overnight_rate}
                onChange={(e) => {
                  setRateInputs(prev => ({ ...prev, overnight_rate: e.target.value }));
                  const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    handleChange('overnight_rate', numValue);
                  }
                }}
                onBlur={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (isNaN(numValue) || numValue < 0) {
                    setRateInputs(prev => ({ ...prev, overnight_rate: '0' }));
                    handleChange('overnight_rate', 0);
                  } else {
                    setRateInputs(prev => ({ ...prev, overnight_rate: String(numValue) }));
                  }
                }}
                placeholder="0.00"
                inputMode="decimal"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>

            <div className="form-group">
              <label>Starting Invoice Number</label>
              <input
                type="number"
                value={settings.starting_invoice_number || ''}
                onChange={(e) => handleChange('starting_invoice_number', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="1"
                min="1"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
                First invoice number for each year (e.g., 100 = INV-2025-0100). Leave empty to start at 1.
              </small>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.invoice_number_include_year !== false}
                  onChange={(e) => handleChange('invoice_number_include_year', e.target.checked)}
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                />
                Include year in invoice numbers
              </label>
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                When enabled, invoice numbers include the year (e.g., INV-2024-0001). When disabled, use simple sequential numbers (e.g., INV-0001).
              </small>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Company Information</h3>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={settings.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
              style={{ pointerEvents: 'auto', cursor: 'text' }}
            />
          </div>

          <div className="form-group">
            <label>Company Address</label>
            <textarea
              value={settings.company_address || ''}
              onChange={(e) => handleChange('company_address', e.target.value)}
              rows={2}
              style={{ pointerEvents: 'auto', cursor: 'text' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company Phone</label>
              <input
                type="tel"
                value={settings.company_phone || ''}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>

            <div className="form-group">
              <label>Company Email</label>
              <input
                type="email"
                value={settings.company_email || ''}
                onChange={(e) => handleChange('company_email', e.target.value)}
                style={{ pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Invoice Customization</h3>

          <div className="form-group">
            <label>Company Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              {logoPreview && (
                <div style={{ 
                  position: 'relative', 
                  display: 'inline-block',
                  background: 'transparent',
                  padding: '8px',
                  borderRadius: '8px',
                  // Subtle border only for preview, not on actual logo
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#fafafa',
                }}>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{
                      maxWidth: '150px',
                      maxHeight: '150px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      background: 'transparent',
                      // Remove any default image background
                    }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label
                  htmlFor="logo-upload"
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#1976D2',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
            {logoPreview && (
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Logo Size Preview - Drag the corners to resize
                </label>
                <InvoiceLogoPreview
                  logoPreview={logoPreview}
                  logoWidth={settings.logo_width || 90}
                  logoHeight={settings.logo_height || 70}
                  companyName={settings.company_name || 'Your Company Name'}
                  onSizeChange={(width, height) => {
                    handleChange('logo_width', width);
                    handleChange('logo_height', height);
                  }}
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                  Drag the corners of the logo in the preview above to resize it. The size will be saved automatically.
                </p>
              </div>
            )}
            <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
              Upload a logo to display on your invoices. Supported formats: PNG, JPG, GIF, WebP. Max size: 500KB. Recommended: 200x200px.
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Invoice Header Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={settings.invoice_header_color || '#1a1a1a'}
                  onChange={(e) => handleColorChange('invoice_header_color', e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={settings.invoice_header_color || '#1a1a1a'}
                  onChange={(e) => handleColorChange('invoice_header_color', e.target.value)}
                  placeholder="#1a1a1a"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    pointerEvents: 'auto',
                    cursor: 'text',
                  }}
                />
              </div>
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
                Color for invoice header elements (company name, section headers)
              </small>
            </div>

            <div className="form-group">
              <label>Invoice Title Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={settings.invoice_title_color || '#1a1a1a'}
                  onChange={(e) => handleColorChange('invoice_title_color', e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={settings.invoice_title_color || '#1a1a1a'}
                  onChange={(e) => handleColorChange('invoice_title_color', e.target.value)}
                  placeholder="#1a1a1a"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    pointerEvents: 'auto',
                    cursor: 'text',
                  }}
                />
              </div>
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
                Color for "INVOICE" title text
              </small>
            </div>
          </div>

          {saveMessage && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: saveMessage.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: saveMessage.type === 'success' ? '#2e7d32' : '#c33',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              {saveMessage.text}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Security</h2>
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Auto-Lock Timeout</h3>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: '#555' }}>
          Choose when the app should require your password again after you switch away from it or minimize the window.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => {
              authService.setLockTimeout(-1);
              setLockTimeout(-1);
            }}
            style={{
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: 4,
              border: lockTimeout === -1 ? '2px solid #1976D2' : '1px solid #ccc',
              backgroundColor: lockTimeout === -1 ? '#E3F2FD' : '#fff',
              cursor: 'pointer',
            }}
          >
            <strong>Never</strong>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              Only require password on app restart.
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              authService.setLockTimeout(0);
              setLockTimeout(0);
            }}
            style={{
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: 4,
              border: lockTimeout === 0 ? '2px solid #1976D2' : '1px solid #ccc',
              backgroundColor: lockTimeout === 0 ? '#E3F2FD' : '#fff',
              cursor: 'pointer',
            }}
          >
            <strong>Immediate</strong>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              Always lock when you leave the app.
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              const value = 1 * 60 * 1000;
              authService.setLockTimeout(value);
              setLockTimeout(value);
            }}
            style={{
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: 4,
              border: lockTimeout === 1 * 60 * 1000 ? '2px solid #1976D2' : '1px solid #ccc',
              backgroundColor: lockTimeout === 1 * 60 * 1000 ? '#E3F2FD' : '#fff',
              cursor: 'pointer',
            }}
          >
            <strong>1 minute</strong>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              Lock if you&apos;ve been away for more than 1 minute.
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              const value = 5 * 60 * 1000;
              authService.setLockTimeout(value);
              setLockTimeout(value);
            }}
            style={{
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: 4,
              border: lockTimeout === 5 * 60 * 1000 ? '2px solid #1976D2' : '1px solid #ccc',
              backgroundColor: lockTimeout === 5 * 60 * 1000 ? '#E3F2FD' : '#fff',
              cursor: 'pointer',
            }}
          >
            <strong>5 minutes</strong>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              Lock if you&apos;ve been away for more than 5 minutes.
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              const value = 15 * 60 * 1000;
              authService.setLockTimeout(value);
              setLockTimeout(value);
            }}
            style={{
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: 4,
              border: lockTimeout === 15 * 60 * 1000 ? '2px solid #1976D2' : '1px solid #ccc',
              backgroundColor: lockTimeout === 15 * 60 * 1000 ? '#E3F2FD' : '#fff',
              cursor: 'pointer',
            }}
          >
            <strong>15 minutes</strong>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              Lock if you&apos;ve been away for more than 15 minutes.
            </div>
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Backup & Restore</h2>

        <div
          style={{
            backgroundColor: '#e8f4f8',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            borderLeft: '4px solid #2196F3',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#1976D2' }}>You Control Your Data</h3>
          <p style={{ marginBottom: 0 }}>
            Backups are stored locally on your computer. Your data never leaves your machine unless you choose
            to copy it somewhere else, like an external drive or cloud folder.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleQuickBackup}
            style={{ marginRight: '1rem' }}
          >
            Quick Backup
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBackupToLocation}
            style={{ marginRight: '1rem' }}
          >
            Backup To...
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRestore}
            style={{ marginRight: '1rem' }}
          >
            Restore From Backup
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleOpenBackupsFolder}>
            Open Backups Folder
          </button>
        </div>

        {backupStatus && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: backupStatus.toLowerCase().includes('fail') ? '#ffebee' : '#e8f5e9',
              borderRadius: '4px',
              marginBottom: '1rem',
              whiteSpace: 'pre-line',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          >
            {backupStatus}
          </div>
        )}

        <div>
          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Recent Backups</h3>
          {loadingBackups ? (
            <p>Loading backups...</p>
          ) : backupFiles.length === 0 ? (
            <p style={{ color: '#666' }}>No backups found yet. Create your first backup above.</p>
          ) : (
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      File Name
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Size
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {backupFiles.map((file, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom:
                          index < backupFiles.length - 1 ? '1px solid #eee' : 'none',
                      }}
                    >
                      <td style={{ padding: '0.75rem' }}>{file.name}</td>
                      <td style={{ padding: '0.75rem' }}>{formatDate(file.date)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {formatFileSize(file.size)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            borderLeft: '4px solid #ffc107',
          }}
        >
          <strong>Tip:</strong> You can copy backup files to USB drives, network storage, or any cloud-sync
          folder you use. Backups are just normal files, so you have full control over where they live.
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Data Sync</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Sync your data across devices when both are connected to the internet.
        </p>

        <SyncSettings />
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Security</h2>
        <PasswordChangeSection />
      </div>
    </>
  );
}

function SyncSettings() {
  const [syncStatus, setSyncStatus] = useState<{
    enabled: boolean;
    lastSync?: string;
    status: 'idle' | 'syncing' | 'error';
    error?: string;
  }>({
    enabled: true,
    status: 'idle',
  });
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string>('');
  const [connectedClients, setConnectedClients] = useState<Array<{ deviceId: string; deviceType: 'desktop' | 'mobile'; registeredAt: string; lastSeen: string; name?: string }>>([]);
  const [hubAddress, setHubAddress] = useState<{ ip: string; port: number; isRunning: boolean } | null>(null);

  useEffect(() => {
    loadSyncStatus();
    loadConnectedClients();
    loadHubAddress();
    
    // Refresh connected clients and hub address every 5 seconds
    const interval = setInterval(() => {
      loadConnectedClients();
      loadHubAddress();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      if (window.electronAPI?.syncGetStatus) {
        const status = await window.electronAPI.syncGetStatus();
        setSyncStatus(status);
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const loadConnectedClients = async () => {
    try {
      if (window.electronAPI?.syncGetHubClients) {
        const clients = await window.electronAPI.syncGetHubClients();
        setConnectedClients(clients);
      }
    } catch (error) {
      console.error('Error loading connected clients:', error);
    }
  };

  const loadHubAddress = async () => {
    try {
      if (window.electronAPI?.syncGetHubAddress) {
        const address = await window.electronAPI.syncGetHubAddress();
        setHubAddress(address);
      }
    } catch (error) {
      console.error('Error loading hub address:', error);
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      setSyncResult('');
      
      if (window.electronAPI?.syncSyncAll) {
        const result = await window.electronAPI.syncSyncAll();
        
        if (result.success) {
          const tables = result.syncedTables?.length || 0;
          const conflicts = result.conflicts || 0;
          setSyncResult(
            `Sync completed successfully! Synced ${tables} tables. ${conflicts > 0 ? `${conflicts} conflicts resolved.` : ''}`
          );
        } else {
          setSyncResult('Sync failed: Unknown error');
        }
      } else {
        setSyncResult('Sync API not available');
      }
      
      await loadSyncStatus();
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResult(`Sync error: ${String(error)}`);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (iso?: string): string => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString();
  };

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Sync Status</h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Last sync: {formatDate(syncStatus.lastSync)}
            </p>
          </div>
          <div>
            <span
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                backgroundColor: syncStatus.status === 'syncing' ? '#fff3cd' : syncStatus.status === 'error' ? '#fee' : '#e8f5e9',
                color: syncStatus.status === 'syncing' ? '#856404' : syncStatus.status === 'error' ? '#c33' : '#2e7d32',
                fontWeight: '500',
              }}
            >
              {syncStatus.status === 'syncing' ? 'Syncing...' : syncStatus.status === 'error' ? 'Error' : 'Idle'}
            </span>
          </div>
        </div>

        {syncStatus.error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}
          >
            {syncStatus.error}
          </div>
        )}

        {syncResult && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: syncResult.includes('failed') || syncResult.includes('error') ? '#fee' : '#e8f5e9',
              color: syncResult.includes('failed') || syncResult.includes('error') ? '#c33' : '#2e7d32',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}
          >
            {syncResult}
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleManualSync}
          disabled={syncing}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Hub Mode</h3>
          <span
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: hubAddress?.isRunning ? '#e3f2fd' : '#fee',
              color: hubAddress?.isRunning ? '#1976D2' : '#c33',
              fontWeight: '500',
              fontSize: '0.9rem',
            }}
          >
            {hubAddress?.isRunning ? 'Hub Active' : 'Hub Inactive'}
          </span>
        </div>

        {hubAddress && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#e8f5e9',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '2px solid #4caf50',
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#2e7d32' }}>
              Mobile App Connection Info
            </div>
            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#1b5e20', marginBottom: '0.5rem' }}>
              IP Address: <strong>{hubAddress.ip}</strong>
            </div>
            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#1b5e20', marginBottom: '0.5rem' }}>
              Port: <strong>{hubAddress.port}</strong>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              Enter this IP address and port in the mobile app Settings → Data Sync
            </div>
            {hubAddress.ip === 'Unknown' && (
              <div style={{ fontSize: '0.85rem', color: '#c33', marginTop: '0.5rem', fontStyle: 'italic' }}>
                ⚠️ Could not detect IP address. Make sure you're connected to a network.
              </div>
            )}
          </div>
        )}
        <h3 style={{ marginBottom: '1rem' }}>Connected Clients</h3>
        {connectedClients.length === 0 ? (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fff3cd',
              borderRadius: '4px',
              color: '#856404',
            }}
          >
            No mobile clients connected. Mobile devices will appear here when they connect to this hub.
          </div>
        ) : (
          <div>
            {connectedClients.map((client, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>{client.name || `${client.deviceType}-${client.deviceId.substring(0, 8)}`}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {client.deviceType} • Last seen: {new Date(client.lastSeen).toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    fontSize: '0.85rem',
                  }}
                >
                  Connected
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          padding: '1rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          borderLeft: '4px solid #2196F3',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#1976D2' }}>About Hub Sync</h3>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          This desktop app acts as a sync hub. Mobile devices connect to this hub to synchronize data.
          Both devices must be on the same Wi-Fi network. The hub maintains the authoritative database
          and mobile devices sync with it. Conflicts are resolved at the hub using last-write-wins strategy.
        </p>
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fff3cd', borderRadius: '4px', borderLeft: '4px solid #ffc107' }}>
          <strong style={{ color: '#856404' }}>Troubleshooting:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', fontSize: '0.85rem', color: '#856404' }}>
            <li>If mobile app can't connect, check Windows Firewall settings</li>
            <li>Make sure both devices are on the same Wi-Fi network</li>
            <li>Verify the IP address shown above matches your computer's network IP</li>
            <li>Try temporarily disabling firewall to test connection</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function PasswordChangeSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    if (password) {
      const validation = validatePasswordComplexity(password);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const validation = validatePasswordComplexity(newPassword);
    if (!validation.valid) {
      setError(validation.errors.join('. '));
      setPasswordErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('An error occurred while changing password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
          disabled={submitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
          placeholder="Enter new password"
          required
          disabled={submitting}
        />
        {passwordErrors.length > 0 && (
          <div style={{ marginTop: '5px', fontSize: '0.85rem', color: '#dc3545' }}>
            {passwordErrors.map((err, idx) => (
              <div key={idx}>• {err}</div>
            ))}
          </div>
        )}
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.9rem' }}>
          <strong>Password Requirements:</strong>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li style={{ color: newPassword.length >= 8 ? '#28a745' : '#666' }}>
              At least 8 characters
            </li>
            <li style={{ color: /[A-Z]/.test(newPassword) ? '#28a745' : '#666' }}>
              One uppercase letter
            </li>
            <li style={{ color: /[a-z]/.test(newPassword) ? '#28a745' : '#666' }}>
              One lowercase letter
            </li>
            <li style={{ color: /[0-9]/.test(newPassword) ? '#28a745' : '#666' }}>
              One number
            </li>
            <li style={{ color: SPECIAL_CHAR_REGEX.test(newPassword) ? '#28a745' : '#666' }}>
              One special character (!@#$%^&*()_+-=[]{}|;:,.&lt;&gt;?)
            </li>
          </ul>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input
          id="confirmNewPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          disabled={submitting}
        />
      </div>

      {error && (
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '4px', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32', 
          borderRadius: '4px', 
          marginBottom: '1rem' 
        }}>
          {success}
        </div>
      )}

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={submitting || !currentPassword || !newPassword || newPassword !== confirmPassword || passwordErrors.length > 0}
        >
          {submitting ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
