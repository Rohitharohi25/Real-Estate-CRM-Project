import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { dealService } from '../services/dealService';
import { noteService } from '../services/noteService';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

const STAGES = ['new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost'];
const labelize = (value) => value?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';
const formatDate = (value, pattern = 'MMM d, yyyy') => (value ? format(new Date(value), pattern) : 'None');

const DealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchDeal = () => {
    setLoading(true);
    Promise.all([dealService.get(id), noteService.list({ deal: id })])
      .then(([dr, nr]) => { setDeal(dr.data); setNotes(nr.data); })
      .catch(() => navigate('/deals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeal(); }, [id]);

  const updateDeal = async (payload) => {
    setSaving(true);
    try {
      await dealService.update(id, payload);
      toast.success('Deal updated');
      fetchDeal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update deal');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await noteService.create({ content: noteText, deal: id });
      toast.success('Note added');
      setNoteText('');
      fetchDeal();
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await noteService.remove(noteId);
      toast.success('Note deleted');
      fetchDeal();
    } catch {
      toast.error('Failed to delete note');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!deal) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-secondary p-2" onClick={() => navigate('/deals')} aria-label="Back to deals">
          <FiArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-slate-800 dark:text-slate-50">{deal.title}</h1>
          <p className="text-sm text-slate-500">${Number(deal.value || 0).toLocaleString()} pipeline value</p>
        </div>
        <StatusBadge status={deal.stage} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 lg:col-span-2">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Deal Progress</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {STAGES.map((stage) => (
              <button
                key={stage}
                className={deal.stage === stage ? 'btn-primary' : 'btn-secondary'}
                onClick={() => updateDeal({ stage })}
                disabled={saving || deal.stage === stage}
              >
                {labelize(stage)}
              </button>
            ))}
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Probability</span>
              <span>{deal.probability ?? 0}%</span>
            </div>
            <div className="h-2 rounded bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded bg-primary-500" style={{ width: `${deal.probability ?? 0}%` }} />
            </div>
          </div>
          {deal.lostReason && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Lost reason: {deal.lostReason}
            </p>
          )}
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Deal Info</h2>
          <div>
            <p className="text-xs text-slate-400">Customer</p>
            {deal.customer ? (
              <Link className="text-sm font-medium text-primary-600 hover:underline" to={`/customers/${deal.customer._id}`}>
                {deal.customer.name || deal.customer.company}
              </Link>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-200">None</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400">Assigned To</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">{deal.assignedTo?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Expected Close</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">{formatDate(deal.expectedCloseDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Last Updated</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">{formatDate(deal.updatedAt, 'MMM d, yyyy HH:mm')}</p>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Notes</h2>
        <div className="flex gap-2">
          <textarea className="input flex-1 resize-none" rows={2} placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <button className="btn-primary self-start" onClick={handleAddNote} disabled={addingNote || !noteText.trim()}>
            {addingNote ? '...' : 'Add'}
          </button>
        </div>
        {notes.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note._id} className="group rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-sm text-slate-700 dark:text-slate-200">{note.content}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {note.createdBy?.name || 'Unknown'} - {format(new Date(note.createdAt), 'MMM d, yyyy')}
                </span>
                <button className="invisible text-slate-400 hover:text-red-500 group-hover:visible" onClick={() => handleDeleteNote(note._id)}>
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealDetails;
