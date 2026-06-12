'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  ArrowRight,
  GraduationCap,
  Search,
} from 'lucide-react';
import type { AppView } from '@/types';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'course' | 'post' | 'assessment';
  meta?: string;
  view: AppView;
}

export function SearchDialog() {
  const { activeModal, setActiveModal, setView, appMode, currentTenant } = useAppStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync open state with activeModal
  useEffect(() => {
    if (activeModal === 'search') {
      setOpen(true);
      setActiveModal(null);
    }
  }, [activeModal, setActiveModal]);

  // Keyboard shortcut: cmd+K / ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch search results
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const tenantId = currentTenant?.id || '';
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();

          const mapped: SearchResult[] = [];

          // Map courses
          for (const c of (data.courses || []) as any[]) {
            mapped.push({
              id: c.id,
              title: c.title,
              description: c.description || `${c.category || 'Uncategorized'} · ${c.level} · $${c.price}`,
              type: 'course',
              meta: `${c.enrollmentCount} students · ${c.avgRating?.toFixed(1) || '0'}★`,
              view: appMode === 'admin' ? 'admin-courses' : 'learner-course',
            });
          }

          // Map community posts
          for (const p of (data.posts || []) as any[]) {
            mapped.push({
              id: p.id,
              title: p.title,
              description: p.content?.substring(0, 100) || '',
              type: 'post',
              meta: `${p.type} · by ${p.author?.name || 'Unknown'} · ${p.likeCount}❤`,
              view: appMode === 'admin' ? 'admin-community' : 'learner-community',
            });
          }

          // Map assessments
          for (const a of (data.assessments || []) as any[]) {
            mapped.push({
              id: a.id,
              title: a.title,
              description: a.description || `${a.type} · Pass: ${a.passingScore}%`,
              type: 'assessment',
              meta: a.course?.title || 'No course',
              view: 'admin-assessments',
            });
          }

          setResults(mapped);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, appMode, currentTenant?.id]);

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    setView(result.view);
  }, [setView]);

  const typeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case 'post': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'assessment': return <ClipboardCheck className="h-4 w-4 text-amber-500" />;
    }
  };

  const typeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'course': return 'Courses';
      case 'post': return 'Community';
      case 'assessment': return 'Assessments';
    }
  };

  const courseResults = results.filter((r) => r.type === 'course');
  const postResults = results.filter((r) => r.type === 'post');
  const assessmentResults = results.filter((r) => r.type === 'assessment');

  // Quick navigation items for when there's no query
  const quickNav: { label: string; view: AppView; icon: React.ReactNode }[] = appMode === 'admin'
    ? [
        { label: 'Go to Dashboard', view: 'admin-dashboard', icon: <GraduationCap className="h-4 w-4" /> },
        { label: 'Go to Courses', view: 'admin-courses', icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Go to Community', view: 'admin-community', icon: <MessageSquare className="h-4 w-4" /> },
        { label: 'Go to Assessments', view: 'admin-assessments', icon: <ClipboardCheck className="h-4 w-4" /> },
        { label: 'Go to Settings', view: 'admin-settings', icon: <Search className="h-4 w-4" /> },
      ]
    : [
        { label: 'Go to Dashboard', view: 'learner-dashboard', icon: <GraduationCap className="h-4 w-4" /> },
        { label: 'Go to My Courses', view: 'learner-course', icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Go to Community', view: 'learner-community', icon: <MessageSquare className="h-4 w-4" /> },
        { label: 'Go to Achievements', view: 'learner-achievements', icon: <Search className="h-4 w-4" /> },
        { label: 'Go to AI Tutor', view: 'ai-assistant', icon: <Search className="h-4 w-4" /> },
      ];

  return (
    <CommandDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setQuery('');
          setResults([]);
        }
      }}
      title="Search"
      description="Search courses, community posts, and assessments"
    >
      <CommandInput
        placeholder="Search courses, posts, assessments..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.length >= 2 ? (
          <>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Searching...
                </div>
              </div>
            )}
            {!loading && results.length === 0 && (
              <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
            )}
            {courseResults.length > 0 && (
              <CommandGroup heading="Courses">
                {courseResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    {typeIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      )}
                    </div>
                    {result.meta && (
                      <span className="text-xs text-muted-foreground shrink-0">{result.meta}</span>
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {postResults.length > 0 && (
              <CommandGroup heading="Community">
                {postResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    {typeIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      )}
                    </div>
                    {result.meta && (
                      <span className="text-xs text-muted-foreground shrink-0">{result.meta}</span>
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {assessmentResults.length > 0 && (
              <CommandGroup heading="Assessments">
                {assessmentResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    {typeIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      )}
                    </div>
                    {result.meta && (
                      <span className="text-xs text-muted-foreground shrink-0">{result.meta}</span>
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        ) : (
          <>
            <CommandGroup heading="Quick Navigation">
              {quickNav.map((item) => (
                <CommandItem
                  key={item.view}
                  onSelect={() => {
                    setOpen(false);
                    setQuery('');
                    setView(item.view);
                  }}
                  className="cursor-pointer"
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
              Type at least 2 characters to search
            </div>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
