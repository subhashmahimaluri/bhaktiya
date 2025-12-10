'use client';

import ImageGallery from '@/components/admin/ImageGallery';
import ImageUploader, { UploadedImage } from '@/components/admin/ImageUploader';
import SummernoteEditor, { SummernoteEditorRef } from '@/components/admin/SummernoteEditor';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner, Tab, Tabs } from 'react-bootstrap';

interface BlockEditorProps {
  blockId?: string;
}

interface BlockData {
  id: string;
  title: { te: string; en: string; hi: string; kn: string };
  content: { te: string; en: string; hi: string; kn: string };
  blockPath: string;
  imageUrl?: string;
  videoId?: { te: string; en: string; hi: string; kn: string };
  status: string;
  locales: string[];
  order: number;
}

export default function BlockEditor({ blockId }: BlockEditorProps) {
  const router = useRouter();
  const editorRef = useRef<SummernoteEditorRef>(null);
  const [currentLocale, setCurrentLocale] = useState('te');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [showImageActionModal, setShowImageActionModal] = useState(false);

  const [formData, setFormData] = useState({
    title: { te: '', en: '', hi: '', kn: '' },
    content: { te: '', en: '', hi: '', kn: '' },
    videoId: { te: '', en: '', hi: '', kn: '' },
    blockPath: '',
    imageUrl: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    locales: ['te', 'en', 'hi', 'kn'],
    order: 0,
  });

  // Load block data if editing
  useEffect(() => {
    if (blockId && router.isReady) {
      loadBlock();
    }
  }, [blockId, router.isReady]);

  const loadBlock = async () => {
    if (!blockId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/blocks/${blockId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setErrors(['Block not found']);
          return;
        }
        throw new Error(`Failed to fetch block: ${response.status}`);
      }

      const block = await response.json();

      // Map status from GraphQL format to lowercase
      const statusMap: Record<string, 'draft' | 'published' | 'archived'> = {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        ARCHIVED: 'archived',
      };

      setFormData({
        title: block.title || { te: '', en: '', hi: '', kn: '' },
        content: block.content || { te: '', en: '', hi: '', kn: '' },
        videoId: block.videoId || { te: '', en: '', hi: '', kn: '' },
        blockPath: block.blockPath || '',
        imageUrl: block.imageUrl || '',
        status: statusMap[block.status] || 'draft',
        locales: block.locales || ['te', 'en', 'hi', 'kn'],
        order: block.order || 0,
      });
    } catch (error) {
      setErrors(['Failed to load block data']);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: { ...prev.title, [currentLocale]: value },
    }));
  };

  const handleFieldChange = (field: string, value: any) => {
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        title: { ...prev.title, [currentLocale]: value },
      }));
    } else if (field === 'content') {
      setFormData(prev => ({
        ...prev,
        content: { ...prev.content, [currentLocale]: value },
      }));
    } else if (field === 'videoId') {
      setFormData(prev => ({
        ...prev,
        videoId: { ...prev.videoId, [currentLocale]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleEditorChange = (data: string) => {
    // Directly update the content for the current locale
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [currentLocale]: data },
    }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.blockPath?.trim()) {
      newErrors.push('Block Path is required');
    }

    if (!formData.title[currentLocale as keyof typeof formData.title]?.trim()) {
      newErrors.push('Title is required');
    }

    if (!formData.content[currentLocale as keyof typeof formData.content]?.trim()) {
      newErrors.push('Content is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      // Map status from lowercase to GraphQL format
      const statusMap: Record<string, string> = {
        draft: 'DRAFT',
        published: 'PUBLISHED',
        archived: 'ARCHIVED',
      };

      const blockData = {
        title: formData.title,
        content: formData.content,
        videoId: formData.videoId,
        blockPath: formData.blockPath,
        imageUrl: formData.imageUrl || undefined,
        status: statusMap[formData.status],
        locales: formData.locales,
        order: formData.order,
      };

      let response;

      if (blockId) {
        // Update existing block
        response = await fetch(`/api/blocks/${blockId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(blockData),
        });
      } else {
        // Create new block
        response = await fetch('/api/blocks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(blockData),
        });
      }

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Redirect to manage blocks page
      router.push('/admin/manage-blocks');
    } catch (error) {
      const errorMessage = `Failed to save block: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setErrors([errorMessage]);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setFormData(prev => ({ ...prev, status: 'draft' }));
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  // Image management functions
  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImages(prev => [...prev, image]);
  };

  const handleImageUploadError = (error: string) => {
    setErrors(prev => [...prev, `Image upload error: ${error}`]);
  };

  const handleImageSelect = (image: UploadedImage) => {
    setSelectedImage(image);
    setShowImageActionModal(true);
    setShowImageManager(false);
  };

  const handleImageAction = (action: 'insert' | 'setAsBlockImage' | 'both') => {
    if (!selectedImage) return;

    if (action === 'insert' || action === 'both') {
      if (editorRef.current) {
        editorRef.current.insertImage(
          selectedImage.urls?.webp || selectedImage.urls?.original || selectedImage.url
        );
      }
    }

    if (action === 'setAsBlockImage' || action === 'both') {
      const imageUrl =
        selectedImage.urls?.webp || selectedImage.urls?.original || selectedImage.url;
      setFormData(prev => ({
        ...prev,
        imageUrl,
      }));
    }

    setShowImageActionModal(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading block...</p>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h1>{blockId ? 'Edit Block' : 'New Block'}</h1>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </Col>
      </Row>

      {errors.length > 0 && (
        <Alert variant="danger">
          <ul className="mb-0">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            {/* Language Tabs */}
            <Card className="mb-3">
              <Card.Header>
                <div className="d-flex gap-2">
                  {['te', 'en', 'hi', 'kn'].map(locale => (
                    <Button
                      key={locale}
                      variant={currentLocale === locale ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => setCurrentLocale(locale)}
                    >
                      {locale.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </Card.Header>
            </Card>

            {/* Block Path */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="bi bi-link-45deg me-2"></i>
                  Block Location
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-0">
                  <Form.Label>Block Path (URL path where this block will be displayed)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.blockPath}
                    onChange={e => handleFieldChange('blockPath', e.target.value)}
                    placeholder="e.g., /homepage/banner, /footer/info, /about/testimonials"
                    required
                  />
                  <Form.Text className="text-muted">
                    Unique path identifier for this block (used by frontend to fetch and display)
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Language-specific Content */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="bi bi-translate me-2"></i>
                  Content ({currentLocale.toUpperCase()})
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Title ({currentLocale.toUpperCase()})</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title[currentLocale as keyof typeof formData.title] || ''}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Enter block title"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>YouTube Video ID ({currentLocale.toUpperCase()})</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.videoId[currentLocale as keyof typeof formData.videoId] || ''}
                    onChange={e => handleFieldChange('videoId', e.target.value)}
                    placeholder="Enter YouTube video ID (e.g., dQw4w9WgXcQ)"
                  />
                  <Form.Text className="text-muted">
                    YouTube video ID from the URL (e.g., for
                    https://youtube.com/watch?v=dQw4w9WgXcQ, enter &apos;dQw4w9WgXcQ&apos;)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label>Content ({currentLocale.toUpperCase()})</Form.Label>
                  <SummernoteEditor
                    ref={editorRef}
                    data={formData.content[currentLocale as keyof typeof formData.content] || ''}
                    onChange={handleEditorChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Publish Settings */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Publish Settings</h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, status: e.target.value as any }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Display Order</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.order}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                  />
                  <Form.Text className="text-muted">Lower numbers appear first</Form.Text>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Saving...' : blockId ? 'Update' : 'Create'} Block
                  </Button>
                  <Button
                    type="button"
                    variant="outline-primary"
                    disabled={saving}
                    onClick={handleSaveAsDraft}
                  >
                    Save as Draft
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Image Management */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="bi bi-image me-2"></i>
                  Block Image
                </h6>
              </Card.Header>
              <Card.Body>
                <Tabs defaultActiveKey="upload" className="mb-3">
                  <Tab eventKey="upload" title="Upload">
                    <ImageUploader
                      locale={currentLocale}
                      contentType="general"
                      contentId={blockId}
                      onImageUploaded={handleImageUploaded}
                      onImageUploadError={handleImageUploadError}
                      multiple={false}
                      maxFiles={1}
                      showPreview={false}
                      className="mb-3"
                    />

                    {uploadedImages.length > 0 && (
                      <div>
                        <h6 className="small fw-bold mb-2">Recently Uploaded</h6>
                        <div className="row g-2">
                          {uploadedImages.slice(-1).map(image => (
                            <div key={image.id} className="col-12">
                              <div
                                className="position-relative cursor-pointer"
                                onClick={() => {
                                  setSelectedImage(image);
                                  setShowImageActionModal(true);
                                }}
                              >
                                <Image
                                  src={image.urls?.thumbnail || image.urls?.original || image.url}
                                  alt={image.alt || image.originalName}
                                  className="img-fluid rounded"
                                  width={100}
                                  height={60}
                                  style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Tab>

                  <Tab eventKey="gallery" title="Gallery">
                    <div className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowImageManager(true)}
                      >
                        <i className="bi bi-images me-1"></i>
                        Browse Image Gallery
                      </Button>
                    </div>
                  </Tab>
                </Tabs>

                {formData.imageUrl && (
                  <div>
                    <h6 className="small fw-bold mb-2">Current Block Image</h6>
                    <Image
                      src={formData.imageUrl}
                      alt="Block image"
                      className="img-fluid rounded"
                      width={100}
                      height={60}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Image Gallery Modal */}
      {showImageManager && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowImageManager(false)}
        >
          <div className="modal-dialog modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-images me-2"></i>
                  Image Gallery
                </h5>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowImageManager(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              </div>
              <div className="modal-body">
                <ImageGallery
                  locale={currentLocale}
                  contentType="general"
                  contentId={blockId}
                  onImageSelect={handleImageSelect}
                  selectable={true}
                  showEditOptions={false}
                />
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowImageManager(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Action Modal */}
      {showImageActionModal && selectedImage && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowImageActionModal(false)}
        >
          <div className="modal-dialog modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-image me-2"></i>
                  What would you like to do with this image?
                </h5>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowImageActionModal(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-4">
                    <Image
                      src={
                        selectedImage.urls?.thumbnail ||
                        selectedImage.urls?.original ||
                        selectedImage.url
                      }
                      alt={selectedImage.alt || selectedImage.originalName}
                      className="img-fluid rounded"
                      width={200}
                      height={150}
                      style={{ width: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-8">
                    <h6 className="fw-bold">{selectedImage.originalName}</h6>
                    {selectedImage.dimensions && (
                      <p className="text-muted small mb-1">
                        {selectedImage.dimensions.width} × {selectedImage.dimensions.height}
                      </p>
                    )}
                    <p className="text-muted small mb-3">
                      {(selectedImage.size / 1024).toFixed(1)} KB
                    </p>

                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleImageAction('setAsBlockImage')}
                      >
                        <i className="bi bi-image me-2"></i>
                        Set as Block Image
                      </Button>

                      <Button variant="outline-primary" onClick={() => handleImageAction('insert')}>
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Insert into Content
                      </Button>

                      <Button variant="success" onClick={() => handleImageAction('both')}>
                        <i className="bi bi-check-all me-2"></i>
                        Do Both
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowImageActionModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
