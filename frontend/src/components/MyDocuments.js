import React, { useState, useEffect } from 'react';
import { FiEye, FiUpload, FiCheck, FiX, FiFileText, FiUser, FiSend, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';


const MyDocuments = ({ doctorId, doctorData, onDocumentUpdate }) => {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState({});
  const [draftDocuments, setDraftDocuments] = useState({});
  const [submittingForReview, setSubmittingForReview] = useState(false);
  const [discardingDrafts, setDiscardingDrafts] = useState(false);

  const documentTypes = {
    profilePhoto: {
      label: 'Profile Photo',
      icon: <FiUser />,
      description: 'Your profile picture (visible to patients)'
    },
    degreeDocument: {
      label: 'Degree Certificate',
      icon: <FiFileText />,
      description: 'Medical degree certificate'
    },
    licenseDocument: {
      label: 'Medical License',
      icon: <FiFileText />,
      description: 'Medical council license'
    },
    idProof: {
      label: 'Government ID',
      icon: <FiFileText />,
      description: 'Government issued ID proof'
    }
  };

  useEffect(() => {
    if (doctorData) {
      processDocumentsFromProfile();
    } else {
      fetchDocuments();
    }
  }, [doctorId, doctorData]);

  const processDocumentsFromProfile = () => {
    try {
      setLoading(true);
      const processedDocs = {};
      const drafts = {};
      
      console.log('Processing documents from doctor data:', doctorData);
      
      // Process each document type from doctor profile
      Object.keys(documentTypes).forEach(type => {
        const docData = doctorData[type];
        const draftData = doctorData.draftDocuments?.[type];
        
        console.log(`Processing ${type}:`, docData);
        console.log(`Draft ${type}:`, draftData);
        
        // Check if document exists and has data (base64 string or buffer)
        if (docData && docData.data && docData.contentType) {
          processedDocs[type] = {
            hasFile: true,
            originalName: docData.originalName || `${type}.${docData.contentType?.split('/')[1] || 'file'}`,
            size: docData.size || 0,
            contentType: docData.contentType
          };
        } else {
          processedDocs[type] = {
            hasFile: false
          };
        }

        // Check for draft documents
        if (draftData && draftData.data && draftData.contentType) {
          drafts[type] = {
            hasFile: true,
            originalName: draftData.originalName || `${type}.${draftData.contentType?.split('/')[1] || 'file'}`,
            size: draftData.size || 0,
            contentType: draftData.contentType
          };
        }
      });
      
      console.log('Processed documents:', processedDocs);
      console.log('Draft documents:', drafts);
      setDocuments(processedDocs);
      setDraftDocuments(drafts);
    } catch (error) {
      console.error('Error processing documents from profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Fallback: try to fetch doctor profile if doctorData not provided
      const response = await api.get(`/doctors/me/profile`);
      const doctorProfile = response.data;
      
      const processedDocs = {};
      Object.keys(documentTypes).forEach(type => {
        const docData = doctorProfile[type];
        // Check if document exists and has data (base64 string or buffer)
        if (docData && docData.data && docData.contentType) {
          processedDocs[type] = {
            hasFile: true,
            originalName: docData.originalName || `${type}.${docData.contentType?.split('/')[1] || 'file'}`,
            size: docData.size || 0,
            contentType: docData.contentType
          };
        } else {
          processedDocs[type] = {
            hasFile: false
          };
        }
      });
      
      setDocuments(processedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (type) => {
    setSelectedDocument(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const handleDocumentUpload = async (type, file, submitForReview = false) => {
    if (!file) return;

    // Handle profile photo immediately (no draft mode needed)
    if (type === 'profilePhoto') {
      setUploading(prev => ({ ...prev, [type]: true }));

      try {
        const formData = new FormData();
        formData.append('profilePhoto', file);

        const response = await api.put('/doctors/me/profile-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Update local documents state
        setDocuments(prev => ({
          ...prev,
          [type]: {
            hasFile: true,
            originalName: file.name,
            size: file.size,
            contentType: file.type
          }
        }));

        // Notify parent component if callback provided
        if (onDocumentUpdate) {
          onDocumentUpdate();
        }

        alert(`${documentTypes[type].label} uploaded successfully!`);
        console.log(`${type} uploaded successfully`);
      } catch (error) {
        console.error(`Error uploading ${type}:`, error);
        const errorMessage = error.response?.data?.message || `Failed to upload ${documentTypes[type].label}. Please try again.`;
        alert(errorMessage);
      } finally {
        setUploading(prev => ({ ...prev, [type]: false }));
      }
      return;
    }

    // For verification documents, save as draft by default
    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const formData = new FormData();
      formData.append('document', file);
      if (submitForReview) {
        formData.append('submitForReview', 'true');
      }

      const response = await api.put(`/doctors/me/document/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (submitForReview) {
        // Update main documents
        setDocuments(prev => ({
          ...prev,
          [type]: {
            hasFile: true,
            originalName: file.name,
            size: file.size,
            contentType: file.type
          }
        }));
        // Clear draft
        setDraftDocuments(prev => {
          const newDrafts = { ...prev };
          delete newDrafts[type];
          return newDrafts;
        });
      } else {
        // Update draft documents
        setDraftDocuments(prev => ({
          ...prev,
          [type]: {
            hasFile: true,
            originalName: file.name,
            size: file.size,
            contentType: file.type
          }
        }));
      }

      // Notify parent component if callback provided
      if (onDocumentUpdate) {
        onDocumentUpdate();
      }

      alert(response.data.message);
      console.log(`${type} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      const errorMessage = error.response?.data?.message || `Failed to upload ${documentTypes[type].label}. Please try again.`;
      alert(errorMessage);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };



  const handleSubmitForReview = async () => {
    if (Object.keys(draftDocuments).length === 0) {
      alert('No draft documents to submit for review.');
      return;
    }

    setSubmittingForReview(true);

    try {
      const response = await api.post('/doctors/me/submit-for-review');

      // Clear draft documents and update main documents
      Object.keys(draftDocuments).forEach(type => {
        setDocuments(prev => ({
          ...prev,
          [type]: draftDocuments[type]
        }));
      });
      setDraftDocuments({});

      // Notify parent component if callback provided
      if (onDocumentUpdate) {
        onDocumentUpdate();
      }

      alert(response.data.message);
    } catch (error) {
      console.error('Error submitting for review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit documents for review. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmittingForReview(false);
    }
  };

  const handleDiscardDrafts = async () => {
    if (Object.keys(draftDocuments).length === 0) {
      alert('No draft documents to discard.');
      return;
    }

    if (!window.confirm('Are you sure you want to discard all draft changes? This action cannot be undone.')) {
      return;
    }

    setDiscardingDrafts(true);

    try {
      await api.delete('/doctors/me/draft-documents');
      setDraftDocuments({});
      alert('Draft changes discarded successfully.');
    } catch (error) {
      console.error('Error discarding drafts:', error);
      const errorMessage = error.response?.data?.message || 'Failed to discard draft changes. Please try again.';
      alert(errorMessage);
    } finally {
      setDiscardingDrafts(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="my-documents loading">
        <div className="loading-spinner"></div>
        <p>Loading your documents...</p>
      </div>
    );
  }

  return (
    <div className="my-documents">
      <div className="documents-header">
        <h3>📄 My Uploaded Documents</h3>
        <p>View and manage your uploaded documents</p>
        
        {/* Draft Mode Controls */}
        {Object.keys(draftDocuments).length > 0 && (
          <div className="draft-mode-controls">
            <div className="draft-info">
              <h4>📝 Draft Changes Ready</h4>
              <p>You have {Object.keys(draftDocuments).length} document(s) with unsaved changes.</p>
              <div className="draft-list">
                {Object.keys(draftDocuments).map(type => (
                  <span key={type} className="draft-item">
                    {documentTypes[type].label}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="draft-actions">
              <button 
                className="btn-submit-review"
                onClick={handleSubmitForReview}
                disabled={submittingForReview}
              >
                {submittingForReview ? (
                  <>
                    <div className="upload-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend /> Submit for Admin Review
                  </>
                )}
              </button>
              <button 
                className="btn-discard-drafts"
                onClick={handleDiscardDrafts}
                disabled={discardingDrafts}
              >
                {discardingDrafts ? (
                  <>
                    <div className="upload-spinner"></div>
                    Discarding...
                  </>
                ) : (
                  <>
                    <FiTrash2 /> Discard Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="documents-grid">
        {Object.entries(documentTypes).map(([type, config]) => {
          const doc = documents[type];
          const draftDoc = draftDocuments[type];
          const hasDocument = doc && doc.hasFile;
          const hasDraft = draftDoc && draftDoc.hasFile;
          const isVerificationDoc = type !== 'profilePhoto';
          
          return (
            <div key={type} className={`document-card ${hasDocument ? 'has-document' : 'no-document'} ${hasDraft ? 'has-draft' : ''}`}>
              <div className="document-header">
                <div className="document-icon">
                  {config.icon}
                </div>
                <div className="document-info">
                  <h4>{config.label}</h4>
                  <p>{config.description}</p>
                </div>
                <div className="document-status">
                  {hasDocument ? (
                    <FiCheck className="status-icon success" />
                  ) : (
                    <FiX className="status-icon error" />
                  )}
                </div>
              </div>
              
              {hasDocument || hasDraft ? (
                <div className="document-details">
                  {/* Show draft indicator */}
                  {hasDraft && (
                    <div className="draft-indicator">
                      <span className="draft-badge">📝 Draft Changes</span>
                      <small>New version ready for review</small>
                    </div>
                  )}
                  
                  {/* Show thumbnail for images */}
                  {(hasDocument && doc.contentType?.startsWith('image/')) && (
                    <div className="document-thumbnail">
                      <img
                        src={`data:${doctorData[type]?.contentType};base64,${doctorData[type]?.data}`}
                        alt={config.label}
                        className="thumbnail-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="file-info">
                    <span className="file-name">
                      {hasDraft ? draftDoc.originalName : (hasDocument ? doc.originalName : 'No file')}
                    </span>
                    <span className="file-size">
                      {formatFileSize(hasDraft ? draftDoc.size : (hasDocument ? doc.size : 0))}
                    </span>
                    <span className="file-type">
                      {hasDraft ? draftDoc.contentType : (hasDocument ? doc.contentType : '')}
                    </span>
                  </div>
                  
                  <div className="document-actions">
                    {hasDocument && (
                      <button
                        className="btn-view"
                        onClick={() => handleViewDocument(type)}
                        title="View current document"
                      >
                        <FiEye /> View Current
                      </button>
                    )}
                    
                    <label className="btn-upload-new">
                      {uploading[type] ? (
                        <>
                          <div className="upload-spinner"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiUpload /> {hasDraft ? 'Replace Draft' : 'Update'}
                        </>
                      )}
                      <input
                        type="file"
                        accept={type === 'profilePhoto' ? 'image/*' : '*/*'}
                        onChange={(e) => handleDocumentUpload(type, e.target.files[0])}
                        style={{ display: 'none' }}
                        disabled={uploading[type]}
                      />
                    </label>
                    
                    {isVerificationDoc && (
                      <button
                        className="btn-submit-immediate"
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.accept = '*/*';
                          fileInput.onchange = (e) => {
                            if (e.target.files[0]) {
                              handleDocumentUpload(type, e.target.files[0], true);
                            }
                          };
                          fileInput.click();
                        }}
                        disabled={uploading[type]}
                        title="Upload and submit for review immediately"
                      >
                        <FiSend /> Upload & Submit
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-document">
                  <FiUpload className="upload-icon" />
                  <span>Not uploaded</span>
                  <small>This document was not uploaded during registration</small>
                  
                  <div className="upload-actions">
                    <label className="btn-upload">
                      {uploading[type] ? (
                        <>
                          <div className="upload-spinner"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload /> Upload as Draft
                        </>
                      )}
                      <input
                        type="file"
                        accept={type === 'profilePhoto' ? 'image/*' : '*/*'}
                        onChange={(e) => handleDocumentUpload(type, e.target.files[0])}
                        style={{ display: 'none' }}
                        disabled={uploading[type]}
                      />
                    </label>
                    
                    {isVerificationDoc && (
                      <button
                        className="btn-upload-submit"
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.accept = '*/*';
                          fileInput.onchange = (e) => {
                            if (e.target.files[0]) {
                              handleDocumentUpload(type, e.target.files[0], true);
                            }
                          };
                          fileInput.click();
                        }}
                        disabled={uploading[type]}
                        title="Upload and submit for review immediately"
                      >
                        <FiSend /> Upload & Submit
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="documents-note">
        <h4>📝 Document Update System:</h4>
        <ul>
          <li><strong>Profile Photo:</strong> Updates immediately and is visible to patients</li>
          <li><strong>Verification Documents:</strong> Saved as drafts first, then submitted for admin review</li>
          <li><strong>Draft Mode:</strong> Update multiple documents, then submit all at once for review</li>
          <li><strong>Immediate Submit:</strong> Use "Upload & Submit" to bypass draft mode</li>
          <li><strong>Review Process:</strong> Your profile goes to "Pending" status during admin review</li>
          <li><strong>Continue Practicing:</strong> You can still see patients while documents are under review</li>
          <li><strong>Accepted Formats:</strong> PDF, JPG, PNG (Max size: 5MB per file)</li>
          <li><strong>Security:</strong> All documents are encrypted and stored securely</li>
        </ul>
      </div>

      {/* Document Viewer Modal */}
      {isModalOpen && selectedDocument && documents[selectedDocument]?.hasFile && (
        <div 
          className="document-modal-overlay" 
          onClick={closeModal}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeModal();
            }
          }}
          tabIndex={0}
        >
          <div className="document-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{documentTypes[selectedDocument].label}</h3>
              <button 
                className="close-btn" 
                onClick={closeModal}
                title="Close (Esc)"
                autoFocus
              >
                <FiX />
              </button>
            </div>
            
            <div className="modal-content">
              {documents[selectedDocument]?.contentType?.startsWith('image/') ? (
                <img
                  src={`data:${doctorData[selectedDocument]?.contentType};base64,${doctorData[selectedDocument]?.data}`}
                  alt={documentTypes[selectedDocument].label}
                  className="document-image"
                  onError={(e) => {
                    console.error('Image failed to load');
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="document-placeholder">
                  <FiFileText size={64} />
                  <p>Document preview not available</p>
                  <small>This document type cannot be previewed in browser</small>
                  <button 
                    className="btn-download"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:${doctorData[selectedDocument]?.contentType};base64,${doctorData[selectedDocument]?.data}`;
                      link.download = doctorData[selectedDocument]?.originalName || `${selectedDocument}.file`;
                      link.click();
                    }}
                  >
                    Download Document
                  </button>
                </div>
              )}
              <div className="document-error" style={{ display: 'none' }}>
                <FiFileText size={64} />
                <p>Unable to load document</p>
                <small>The document may be corrupted or in an unsupported format</small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={closeModal}>
                <FiX /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;