import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { DocumentList } from '@/components/DocumentList';
import { Editor, Document } from '@/components/Editor/Editor';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    documents, 
    isLoading: docsLoading, 
    createDocument, 
    updateDocument, 
    deleteDocument,
    isCreating 
  } = useDocuments();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateDocument = async () => {
    try {
      const newDoc = await createDocument();
      setSelectedDocument(newDoc);
      toast.success('New document created');
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleSaveDocument = async (updates: Partial<Document>) => {
    if (!updates.id) return;
    
    try {
      await updateDocument(updates as Partial<Document> & { id: string });
      
      // Update the selected document with new values
      if (selectedDocument?.id === updates.id) {
        setSelectedDocument((prev) =>
          prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null
        );
      }
    } catch (error) {
      toast.error('Failed to save document');
      throw error;
    }
  };

  const handleBack = () => {
    setSelectedDocument(null);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (authLoading || docsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {selectedDocument ? (
          <Editor
            key="editor"
            document={selectedDocument}
            onSave={handleSaveDocument}
            onBack={handleBack}
          />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar isLoggedIn onLogout={handleLogout} />
            <main className="pt-20 max-w-4xl mx-auto">
              <DocumentList
                documents={documents}
                onSelect={handleSelectDocument}
                onDelete={handleDeleteDocument}
                onCreate={handleCreateDocument}
                isCreating={isCreating}
              />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
