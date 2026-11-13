import { FiSearch } from 'react-icons/fi';

// Shared search + filter row used at the top of list pages (Customers, Leads, Deals, Tasks, Users).
const SearchFilterBar = ({ search, onSearchChange, filters = [], actions }) => (
  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
    <div className="relative w-full lg:min-w-[220px] lg:flex-1">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="input pl-9"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    {filters.map((f) => (
      <select key={f.name} className="input w-full lg:w-auto" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
        <option value="">{f.label}</option>
        {f.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ))}
    {actions && <div className="flex w-full flex-col gap-2 sm:flex-row lg:ml-auto lg:w-auto">{actions}</div>}
  </div>
);

export default SearchFilterBar;
