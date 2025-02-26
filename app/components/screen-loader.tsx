export const ScreenLoader = () => {
  return (
    <div className="flex flex-col items-center gap-2 justify-center fixed inset-0 z-50 bg-background transition-opacity duration-700 ease-in-out">
      <img
        className="h-[30px] max-w-none"
        src={'/media/brand/logo-mini.svg'}
        alt="logo"
      />
      <div className="text-muted-foreground font-medium text-sm">
        Loading...
      </div>
    </div>
  );
};
