import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { leadService } from '../services/leadService';
import { noteService } from '../services/noteService';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [converting, setConverting] = useState(false);

  const fetch = () => {
    Promise.all([leadService.get(id), noteService.list({ lead: id })])
      .then(([lr, nr]) => { setData(lr.data); setNotes(nr.data); })
      .catch(() => navigate('/leads'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [id]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await noteService.create({ content: noteText, lead: id });
      toast.success('Note added');
      setNoteText('');
      fetch();
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const handleDeleteNote = async (nid) => {
    try { await noteService.remove(nid); toast.success('Note deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      await leadService.convert(id);
      toast.success('Lead converted!');
      navigate('/leads');
    } catch (err) { toast.error(err.response?.data?.message || 'Conversion failed'); }
    finally { setConverting(false); }
  };

  if (loading) return <Loader fullScreen />;
  if (!data) return null;
  const l = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="btn-secondary p-2" onClick={() => navigate('/leads')}><FiArrowLeft size={16} /></button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{l.name}</h1>
        <StatusBadge status={l.status} />
        {!l.convertedToCustomer && (
          <button className="btn-secondary ml-auto flex items-center gap-1" onClick={handleConvert} disabled={converting}>
            <FiRefreshCw size={14} className={converting ? 'animate-spin' : ''} />
            Convert to Customer
          </button>
        )}
        {l.convertedToCustomer && (
          <span className="ml-auto badge bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">Converted</span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Lead Info</h2>
          {[['Company', l.company], ['Email', l.email], ['Phone', l.phone],
            ['Source', l.source?.replace(/_/g,' ')], ['Assigned To', l.assignedTo?.name],
            ['Est. Value', l.estimatedValue ? `$${l.estimatedValue.toLocaleString()}` : null],
          ].map(([label, val]) => val ? (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{val}</p>
            </div>
          ) : null)}
        </div>

        <div className="card space-y-4 lg:col-span-2">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Notes</h2>
          <div className="flex gap-2">
            <textarea className="input flex-1 resize-none" rows={2} placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <button className="btn-primary self-start" onClick={handleAddNote} disabled={addingNote || !noteText.trim()}>{addingNote ? '...' : 'Add'}</button>
          </div>
          {notes.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 group">
                <p className="text-sm text-slate-700 dark:text-slate-200">{n.content}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{n.createdBy?.name} · {format(new Date(n.createdAt), 'MMM d, yyyy')}</span>
                  <button className="invisible group-hover:visible text-slate-400 hover:text-red-500" onClick={() => handleDeleteNote(n._id)}><FiTrash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
