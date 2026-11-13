const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-primary-200 border-t-primary-600`}
      role="status"
      aria-label="Loading"
    />
  );

  if (!fullScreen) return spinner;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      {spinner}
    </div>
  );
};

export default Loader;
