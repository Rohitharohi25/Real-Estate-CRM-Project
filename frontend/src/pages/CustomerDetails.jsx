import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { customerService } from '../services/customerService';
import { noteService } from '../services/noteService';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchCustomer = () => {
    customerService.get(id)
      .then((res) => { setData(res.data); setNotes(res.notes); setActivity(res.activity); })
      .catch(() => navigate('/customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomer(); }, [id]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await noteService.create({ content: noteText, customer: id });
      toast.success('Note added');
      setNoteText('');
      fetchCustomer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await noteService.remove(noteId);
      toast.success('Note deleted');
      fetchCustomer();
    } catch {
      toast.error('Failed to delete note');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!data) return null;

  const c = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="btn-secondary p-2" onClick={() => navigate('/customers')} aria-label="Back">
          <FiArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{c.name}</h1>
        <StatusBadge status={c.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info card */}
        <div className="card lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Contact Info</h2>
          {[
            ['Company', c.company], ['Job Title', c.jobTitle],
            ['Email', c.email], ['Phone', c.phone],
            ['Source', c.source?.replace(/_/g,' ')], ['Assigned To', c.assignedTo?.name],
          ].map(([label, val]) => val ? (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{val}</p>
            </div>
          ) : null)}
          {c.address?.city && (
            <div>
              <p className="text-xs text-slate-400">Address</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {[c.address.street, c.address.city, c.address.state, c.address.zip, c.address.country].filter(Boolean).join(', ')}
              </p>
            </div>
          )}
          {c.tags?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400">Tags</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {c.tags.map((t) => <span key={t} className="badge bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">{t}</span>)}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {/* Notes */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">Notes</h2>
            <div className="flex gap-2">
              <textarea
                className="input flex-1 resize-none"
                rows={2}
                placeholder="Add a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button className="btn-primary self-start" onClick={handleAddNote} disabled={addingNote || !noteText.trim()}>
                {addingNote ? '...' : 'Add'}
              </button>
            </div>
            {notes.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 group">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{n.content}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {n.createdBy?.name} · {format(new Date(n.createdAt), 'MMM d, yyyy')}
                    </span>
                    <button className="invisible group-hover:visible text-slate-400 hover:text-red-500" onClick={() => handleDeleteNote(n._id)}>
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">Activity</h2>
            {activity.length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
            <div className="space-y-2">
              {activity.map((a) => (
                <div key={a._id} className="flex gap-3 text-sm">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary-400" />
                  <div>
                    <p className="text-slate-700 dark:text-slate-200">{a.description}</p>
                    <p className="text-xs text-slate-400">{format(new Date(a.createdAt), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
