const Card = ({ title, value, icon: Icon, accent = 'primary', subtitle }) => {
  const accents = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  };

  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-50">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`rounded-lg p-3 ${accents[accent]}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default Card;
