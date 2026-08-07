import Footer from "./(layout)/footer";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden pb-20 w-full lg:w-2/4 mx-auto ">{children}</div>
         
      <Footer />
    </div>
  );
}