const ChartCard = ({ title, children, action }) => (
  <div className="card">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

export default ChartCard;
