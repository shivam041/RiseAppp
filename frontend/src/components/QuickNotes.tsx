import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { QuickNote } from '../types';

interface QuickNotesProps {
  selectedDate: string;
}

const QuickNotes: React.FC<QuickNotesProps> = ({ selectedDate }) => {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const data = await authAPI.getQuickNotes(selectedDate);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setLoading(true);
    try {
      const newNote = await authAPI.createQuickNote({
        content: newNoteContent,
        date: selectedDate,
      });
      setNotes([newNote, ...notes]);
      setNewNoteContent('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: number, content: string) => {
    try {
      const updatedNote = await authAPI.updateQuickNote(noteId, { content });
      setNotes(notes.map(note => 
        note.id === noteId ? updatedNote : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await authAPI.deleteQuickNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Quick Notes ({notes.length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddNote} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Note
            </label>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Write your quick note here..."
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Note'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No notes for this day. Add one to capture your thoughts!
          </p>
        ) : (
          notes.map((note) => (
            <QuickNoteItem
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface QuickNoteItemProps {
  note: QuickNote;
  onUpdate: (noteId: number, content: string) => void;
  onDelete: (noteId: number) => void;
}

const QuickNoteItem: React.FC<QuickNoteItemProps> = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editContent.trim() && editContent !== note.content) {
      onUpdate(note.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              autoFocus
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
          )}
          
          <p className="text-xs text-gray-400 mt-2">
            {new Date(note.created_at).toLocaleTimeString()}
            {note.updated_at !== note.created_at && (
              <span> • Updated {new Date(note.updated_at).toLocaleTimeString()}</span>
            )}
          </p>
        </div>

        <div className="flex gap-2 ml-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-700 p-1"
                title="Save changes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-700 p-1"
                title="Cancel editing"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-700 p-1"
                title="Edit note"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete note"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickNotes;
