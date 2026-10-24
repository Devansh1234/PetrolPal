import Footer from './Footer';

export default function LegalPage({ title, updated, children }) {
  return (
    <>
      <main className="page flex max-w-[760px] flex-col gap-5 leading-relaxed [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-stone-500">Last updated {updated}</p>
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
