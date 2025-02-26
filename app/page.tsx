import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

// Define the type for each link item
interface SocialLink {
  text: string;
  href: string;
  icon: React.ReactNode; // Use ReactNode for JSX elements
}

export default function Page() {
  // Array of link items with proper typing
  const socialLinks: SocialLink[] = [
    {
      text: 'Star us on GitHub',
      href: siteConfig.links.github,
      icon: <Icons.github className="h-4 w-4" />, // Define className here
    },
    {
      text: 'Follow us on X',
      href: siteConfig.links.twitter,
      icon: <Icons.twitter className="size-3.5" />, // Define className here
    },
    {
      text: 'Share your suggestions',
      href: siteConfig.links.suggestions,
      icon: <Sparkles className="h-4 w-4" />, // Define className here
    },
  ];

  return (
    <div className="container h-full flex items-center justify-center py-5">
      <Card className="md:w-[600px]">
        <CardContent className="p-5 md:p-10">
          <h1 className="font-semibold text-3xl mb-5">Welcome to CrudHunt!</h1>
          <div className="text-sm leading-6 mb-4">
            Thank you for exploring CrudHunt, your free copy-and-paste 
            library of production-ready CRUD modules and beautiful UI components crafted with Next.js, React, and Tailwind CSS.
          </div>

          <div className="text-sm leading-6 mb-4">
            To get started, please use the main navigation above to browse
            through our collection of CRUD modules tailored for Next.js and
            React applications.
          </div>

          <div className="text-sm leading-6">
            <div className="mb-5">
              Enjoying CrudHunt? Support us and stay connected! Star us on
              GitHub to help us grow, follow us on X for updates, or share your
              suggestions via GitHub to make it even better every action means
              the world to us:
            </div>

            <div className="space-y-2.5">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <Link
                    className="inline-flex items-center gap-2.5 text-foreground hover:underline hover:underline-offset-2"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.icon}
                    {link.text}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}