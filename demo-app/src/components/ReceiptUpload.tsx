import React, { useState } from 'react';
import { Transaction } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { OCRProcessor } from '../utils/ocrProcessor';
import { AutoCategorizor } from '../utils/autoCategorizor';

interface ReceiptUploadProps {
  transactions: Transaction[];
  onSave: () => void;
  onCancel: () => void;
}

export default function ReceiptUpload({ transactions, onSave, onCancel }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  const handleFileSelect = async () => {
    try {
      setUploading(true);
      setOcrError(null);
      setOcrResult(null);
      const fileData = await window.electronAPI.receiptSelectFile();
      
      if (!fileData) {
        setUploading(false);
        return;
      }

      // Save the receipt file
      const date = new Date().toISOString().split('T')[0];
      const { relativePath } = await window.electronAPI.receiptSave(
        fileData.data,
        fileData.filename,
        date
      );

      // Try OCR if it's an image (support all image formats)
      const isImage = fileData.mimeType.startsWith('image/') || 
                      ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/tif'].includes(fileData.mimeType);
      
      if (isImage) {
        setOcrProcessing(true);
        let ocrData: any = null;
        let receiptId: number | null = null;
        
        try {
          console.log('========================================');
          console.log('🔍 STARTING OCR PROCESSING');
          console.log('========================================');
          console.log('📁 File:', fileData.filename);
          console.log('📦 MIME Type:', fileData.mimeType);
          console.log('📊 Base64 data length:', fileData.data?.length || 0);
          const dataUrl = `data:${fileData.mimeType};base64,${fileData.data}`;
          console.log('🔗 Data URL length:', dataUrl.length);
          
          // Extract OCR data
          console.log('⏳ Calling OCRProcessor.processReceipt...');
          ocrData = await OCRProcessor.processReceipt(dataUrl);
          console.log('========================================');
          console.log('✅ OCR COMPLETED');
          console.log('========================================');
          console.log('📄 Raw text length:', ocrData.raw_text?.length || 0);
          console.log('📄 Raw text (first 500 chars):', ocrData.raw_text?.substring(0, 500) || 'NO TEXT');
          console.log('📄 Raw text (last 500 chars):', ocrData.raw_text?.substring(Math.max(0, (ocrData.raw_text?.length || 0) - 500)) || 'NO TEXT');
          console.log('🏪 Vendor:', ocrData.vendor || '❌ NOT FOUND');
          console.log('📅 Date:', ocrData.date || '❌ NOT FOUND');
          console.log('💰 Total:', ocrData.total !== undefined ? `$${ocrData.total.toFixed(2)}` : '❌ NOT FOUND');
          console.log('💵 Tax:', ocrData.tax !== undefined ? `$${ocrData.tax.toFixed(2)}` : '❌ NOT FOUND');
          console.log('📊 Confidence:', ocrData.confidence ? `${(ocrData.confidence * 100).toFixed(1)}%` : 'N/A');
          console.log('========================================');
          
          setOcrResult(ocrData);
          
          // Show warnings if needed
          if (!ocrData.raw_text || ocrData.raw_text.trim().length === 0) {
            setOcrError('OCR completed but no text was extracted from the image.');
          } else if (ocrData.confidence && ocrData.confidence < 0.3) {
            setOcrError(`OCR confidence is low (${(ocrData.confidence * 100).toFixed(0)}%). Results may be inaccurate.`);
          } else if (!ocrData.vendor && !ocrData.total && !ocrData.date) {
            setOcrError('⚠️ OCR extracted text but could not find vendor, total, or date.');
            setShowRawText(true);
          }
        } catch (ocrError: any) {
          console.error('❌ OCR failed:', ocrError);
          setOcrError(`OCR processing failed: ${ocrError?.message || 'Unknown error'}`);
        }
        
        // ALWAYS SAVE THE RECEIPT - NO MATTER WHAT
        try {
          console.log('💾 Saving receipt to database...');
          
          // Save receipt with ALL OCR data (even if OCR failed, save what we have)
          receiptId = await MockDataService.createReceipt({
            filename: fileData.filename,
            file_path: relativePath,
            file_type: fileData.mimeType,
            ocr_data: ocrData ? JSON.stringify(ocrData) : undefined,
            vendor: ocrData?.vendor || undefined,
            total: ocrData?.total !== undefined ? ocrData.total : undefined,
            tax: ocrData?.tax !== undefined ? ocrData.tax : undefined,
            receipt_date: ocrData?.date || undefined,
          });
          
          console.log('✅ Receipt saved with ID:', receiptId);
          
          // Verify what was saved
          const savedReceipt = await MockDataService.getReceipt(receiptId);
          if (savedReceipt) {
            console.log('🔍 Verification - Saved receipt data:');
            console.log('  - Vendor:', savedReceipt.vendor || 'NULL');
            console.log('  - Total:', savedReceipt.total !== undefined ? savedReceipt.total : 'NULL');
            console.log('  - Tax:', savedReceipt.tax !== undefined ? savedReceipt.tax : 'NULL');
            console.log('  - Date:', savedReceipt.receipt_date || 'NULL');
          }
          
          // Auto-categorize if we have vendor
          let categoryId: number | undefined = undefined;
          let categoryName: string | undefined = undefined;
          if (ocrData?.vendor) {
            try {
              const categories = await MockDataService.getCategories();
              const categoryRules = await MockDataService.getCategoryRules();
              const customRules = categoryRules.map(rule => {
                const category = categories.find(c => c.id === rule.category_id);
                return {
                  category: category?.name || '',
                  keywords: rule.keyword.split(',').map(k => k.trim())
                };
              }).filter(r => r.category);

              const categoryMatch = AutoCategorizor.categorize(
                `Receipt from ${ocrData.vendor}`,
                ocrData.vendor,
                ocrData.total,
                customRules
              );

              if (categoryMatch && categoryMatch.confidence >= 0.6) {
                const matchedCategory = categories.find(
                  c => c.name.toLowerCase() === categoryMatch.categoryName.toLowerCase()
                );
                if (matchedCategory) {
                  categoryId = matchedCategory.id;
                  categoryName = matchedCategory.name;
                }
              }
            } catch (catError) {
              console.error('Error auto-categorizing:', catError);
            }
          }

          // Create transaction if we have a total
          if (ocrData?.total && ocrData.total > 0 && receiptId) {
            try {
              const transactionDate = ocrData.date || new Date().toISOString().split('T')[0];
              const description = ocrData.vendor 
                ? `Receipt from ${ocrData.vendor}`
                : `Receipt: ${fileData.filename}`;
              
              // Ensure amount is always positive for receipts
              const transactionAmount = Math.abs(ocrData.total);
              
              const transactionId = await MockDataService.createTransaction({
                date: transactionDate,
                description: description,
                amount: transactionAmount,
                vendor: ocrData.vendor || undefined,
                category_id: categoryId,
                account_type: undefined,
                is_business: true,
                notes: ocrData.tax ? `Tax: $${ocrData.tax.toFixed(2)}` : undefined,
                receipt_id: receiptId,
              });

              // Link receipt to transaction
              await MockDataService.updateReceipt(receiptId, {
                transaction_id: transactionId,
              });

              console.log('✅ Transaction created with ID:', transactionId);
              
              if (categoryName) {
                alert(`✅ Receipt saved!\nVendor: ${ocrData.vendor || 'Not detected'}\nAmount: $${Math.abs(transactionAmount).toFixed(2)}\nCategory: ${categoryName}`);
              } else {
                alert(`✅ Receipt saved!\nVendor: ${ocrData.vendor || 'Not detected'}\nAmount: $${Math.abs(transactionAmount).toFixed(2)}`);
              }
            } catch (txError) {
              console.error('Error creating transaction:', txError);
              alert(`✅ Receipt saved! (Transaction creation failed: ${txError})`);
            }
          } else {
            // Receipt saved but no transaction (no total detected)
            alert(`✅ Receipt saved!\nVendor: ${ocrData?.vendor || 'Not detected'}\nNote: No transaction created (total amount not detected)`);
          }
          
          // Refresh the parent component
          onSave();
        } catch (saveError: any) {
          console.error('❌ Error saving receipt:', saveError);
          alert(`❌ Error saving receipt: ${saveError?.message || 'Unknown error'}`);
        } finally {
          setOcrProcessing(false);
        }
      } else {
        // Non-image file, skip OCR but still save
        try {
          await MockDataService.createReceipt({
            filename: fileData.filename,
            file_path: relativePath,
            file_type: fileData.mimeType,
          });
          alert('✅ Receipt uploaded successfully! (OCR not available for this file type)');
          onSave();
        } catch (saveError: any) {
          console.error('Error saving non-image receipt:', saveError);
          alert(`❌ Error saving receipt: ${saveError?.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      alert(`Error uploading receipt: ${error?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2>Upload Receipt</h2>
      
      {ocrProcessing ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Processing receipt with OCR...</p>
          <p style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>This may take a moment</p>
          <p style={{ fontSize: '0.75rem', color: '#95a5a6', marginTop: '0.5rem' }}>Analyzing image and extracting text...</p>
        </div>
      ) : ocrResult || ocrError ? (
        <div style={{ marginBottom: '1rem' }}>
          {ocrError && (
            <div style={{ padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f5c6cb' }}>
              <h3 style={{ marginTop: 0, color: '#721c24' }}>⚠️ OCR Warning</h3>
              <p style={{ color: '#721c24', margin: 0 }}>{ocrError}</p>
            </div>
          )}
          {ocrResult && (
            <div style={{ padding: '1rem', backgroundColor: ocrError ? '#fff3cd' : '#d4edda', borderRadius: '4px', border: `1px solid ${ocrError ? '#ffc107' : '#c3e6cb'}` }}>
              <h3 style={{ marginTop: 0, fontSize: '1.25rem', marginBottom: '1rem' }}>
                {ocrError ? '⚠️ OCR Results (Please Verify)' : '✅ OCR Results'}
              </h3>
              {/* Debug info - show what was extracted */}
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                fontFamily: 'monospace'
              }}>
                <strong>🔍 Extraction Status:</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  Vendor: {ocrResult.vendor ? `✅ "${ocrResult.vendor}"` : '❌ NOT FOUND'}
                </div>
                <div>
                  Total: {ocrResult.total !== undefined ? `✅ $${ocrResult.total.toFixed(2)}` : '❌ NOT FOUND'}
                </div>
                <div>
                  Date: {ocrResult.date ? `✅ ${ocrResult.date}` : '❌ NOT FOUND'}
                </div>
                <div>
                  Tax: {ocrResult.tax !== undefined ? `✅ $${ocrResult.tax.toFixed(2)}` : '❌ NOT FOUND'}
                </div>
                {ocrResult.raw_text && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    Text extracted: {ocrResult.raw_text.length} characters
                  </div>
                )}
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '4px'
              }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#555' }}>Vendor:</strong>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    color: ocrResult.vendor ? '#28a745' : '#dc3545',
                    fontWeight: ocrResult.vendor ? 'bold' : 'normal'
                  }}>
                    {ocrResult.vendor || '❌ Not detected'}
                  </span>
                </div>
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#555' }}>Date:</strong>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    color: ocrResult.date ? '#28a745' : '#dc3545',
                    fontWeight: ocrResult.date ? 'bold' : 'normal'
                  }}>
                    {ocrResult.date || '❌ Not detected'}
                  </span>
                </div>
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#555' }}>Total:</strong>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    color: ocrResult.total ? '#28a745' : '#dc3545',
                    fontWeight: ocrResult.total ? 'bold' : 'normal'
                  }}>
                    {ocrResult.total ? `$${ocrResult.total.toFixed(2)}` : '❌ Not detected'}
                  </span>
                </div>
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#555' }}>Tax:</strong>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    color: ocrResult.tax ? '#28a745' : '#dc3545',
                    fontWeight: ocrResult.tax ? 'bold' : 'normal'
                  }}>
                    {ocrResult.tax ? `$${ocrResult.tax.toFixed(2)}` : '❌ Not detected'}
                  </span>
                </div>
              </div>
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Confidence:</strong> {((ocrResult.confidence || 0) * 100).toFixed(0)}%
                </div>
                <div>
                  <strong>Text Extracted:</strong> {ocrResult.raw_text ? `${ocrResult.raw_text.length} characters` : 'None'}
                </div>
              </div>
              {ocrResult.raw_text && (
                <div>
                  <button
                    type="button"
                    className="btn btn-small btn-secondary"
                    onClick={() => setShowRawText(!showRawText)}
                    style={{ marginBottom: '0.5rem', width: '100%' }}
                  >
                    {showRawText ? '▼ Hide' : '▶ Show'} Raw OCR Text ({ocrResult.raw_text.length} chars)
                  </button>
                  {showRawText && (
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px', 
                      border: '1px solid #dee2e6',
                      maxHeight: '300px',
                      overflow: 'auto',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace'
                    }}>
                      {ocrResult.raw_text || 'No text extracted'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Click below to select a receipt image</p>
          <p style={{ fontSize: '0.875rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
            Supported formats: PNG, JPG, JPEG, GIF, WebP, BMP, TIFF
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFileSelect}
            disabled={uploading || ocrProcessing}
            style={{ marginTop: '1rem' }}
          >
            {uploading ? 'Uploading...' : ocrProcessing ? 'Processing...' : 'Select Receipt File'}
          </button>
        </div>
      )}

      <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={() => {
            setOcrResult(null);
            setOcrError(null);
            setShowRawText(false);
            onCancel();
          }}
        >
          {ocrResult || ocrError ? 'Done' : 'Cancel'}
        </button>
        {(ocrResult || ocrError) && (
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => {
              setOcrResult(null);
              setOcrError(null);
              setShowRawText(false);
              onSave();
            }}
          >
            Save & Continue
          </button>
        )}
        <button
          type="button"
          className="btn btn-small btn-secondary"
          onClick={async () => {
            try {
              await window.electronAPI.toggleDevTools();
            } catch (error) {
              console.error('Failed to toggle DevTools:', error);
            }
          }}
          style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          title="Open Developer Console (F12)"
        >
          🔧 Console (F12)
        </button>
      </div>
    </div>
  );
}

