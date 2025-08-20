import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EducationTab from '@/components/dashboard-v2/EducationTab';
import SEOHead from '@/components/SEOHead';
import { getChildren } from '@/lib/api';
import { edu } from '@/lib/educationApi';
import { getWallet } from '@/lib/rewardsApi';
import { yearAndKeyStageFromDOB } from '@/lib/ukSchoolYear';

export default function EducationPage() {
  const { data: children, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: getChildren
  });

  const [openId, setOpenId] = useState<string>("");
  const [wallets, setWallets] = useState<Record<string, any>>({});
  const [books, setBooks] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<Record<string, string>>({});

  // Load wallets, books, timeline when children are loaded
  useEffect(() => {
    if (children?.length) {
      (async () => {
        // Load wallets for all children
        for (const child of children) {
          try {
            const wallet = await getWallet(child.id);
            setWallets(prev => ({ ...prev, [child.id]: wallet }));
          } catch (error) {
            console.error('Error loading wallet for child:', child.id, error);
          }
        }

        // Load books and timeline
        try {
          const [booksData, timelineData] = await Promise.all([
            edu.listBooks("KS2"), // MVP: Load KS2 books
            edu.parentTimeline()
          ]);
          setBooks(booksData || []);
          setTimeline(timelineData || []);
        } catch (error) {
          console.error('Error loading books/timeline:', error);
        }
      })();
    }
  }, [children]);

  const handleStartReading = async (childId: string, bookId?: string) => {
    try {
      const session = await edu.startReading(childId, bookId);
      setActiveSession(prev => ({ ...prev, [childId]: session.id }));
    } catch (error) {
      console.error('Error starting reading session:', error);
    }
  };

  const handleStopReading = async (childId: string) => {
    const sessionId = activeSession[childId];
    if (!sessionId) return;

    try {
      const result = await edu.stopReading({
        session_id: sessionId,
        pages_completed: 4,
        ai_difficulty: "just_right",
        ai_summary: "Read fluently.",
        ai_flags: {},
        transcript_ms: 180000
      });
      
      // Update wallet and remove active session
      const wallet = await getWallet(childId);
      setWallets(prev => ({ ...prev, [childId]: wallet }));
      setActiveSession(prev => {
        const updated = { ...prev };
        delete updated[childId];
        return updated;
      });

      // Refresh timeline
      const timelineData = await edu.parentTimeline();
      setTimeline(timelineData || []);
    } catch (error) {
      console.error('Error stopping reading session:', error);
    }
  };

  const handleAddLearning = async (childId: string) => {
    try {
      await edu.recordLearning({
        child_id: childId,
        subject: "Maths",
        topic: "Fractions",
        ks: "KS2",
        source: "web-app",
        duration_minutes: 15,
        score: 90,
        passed: true
      });

      // Update wallet and timeline
      const [wallet, timelineData] = await Promise.all([
        getWallet(childId),
        edu.parentTimeline()
      ]);
      setWallets(prev => ({ ...prev, [childId]: wallet }));
      setTimeline(timelineData || []);
    } catch (error) {
      console.error('Error recording learning activity:', error);
    }
  };

  if (isLoading) return <div>Loading Education…</div>;
  if (!children?.length) return <div>No children yet.</div>;

  return (
    <div className="space-y-6">
      <SEOHead
        title="Guardian AI | Education Management"
        description="Manage your children's educational journey with personalized learning paths, progress tracking, and AI-powered insights."
      />
      
      <h1 className="text-3xl font-bold">📚 Nova Education</h1>
      
      {children.map((child) => {
        const { yearGroup, keyStage } = yearAndKeyStageFromDOB(child.dob);
        return (
        <Card key={child.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {child.avatar_url && (
                  <img 
                    src={child.avatar_url} 
                    alt={`${child.name}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{child.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Coins: {wallets[child.id]?.coins ?? 0}</span>
                    {child.dob && <span>DOB: {child.dob}</span>}
                    {yearGroup && <span>Year: {yearGroup}</span>}
                    {keyStage && <span>Key Stage: {keyStage}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!activeSession[child.id] ? (
                  <Button 
                    onClick={() => handleStartReading(child.id, books[0]?.id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Start Reading
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleStopReading(child.id)}
                    variant="secondary"
                  >
                    Stop & Save
                  </Button>
                )}
                <Button 
                  onClick={() => handleAddLearning(child.id)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Log Learning
                </Button>
              </div>
            </div>

            {books.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Available Books (KS2)</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {books.slice(0, 5).map((book: any) => (
                    <div key={book.id} className="border rounded px-3 py-2 whitespace-nowrap text-sm">
                      {book.title}
                      {book.author && <div className="text-xs text-muted-foreground">by {book.author}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div 
              className="mt-4 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors p-2 rounded"
              onClick={() => setOpenId(openId === child.id ? "" : child.id)}
            >
              <span className="font-medium">Education Details</span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${
                  openId === child.id ? 'transform rotate-180' : ''
                }`}
              />
            </div>
            
            {openId === child.id && (
              <div className="border-t mt-2 pt-4">
                <EducationTab 
                  childId={child.id}
                  childAge={child.age ?? undefined}
                  hint={''}
                />
              </div>
            )}
          </CardContent>
        </Card>
        );
      })}

      {timeline.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Parent Timeline</h2>
            <div className="space-y-3">
              {timeline.slice(0, 10).map((event: any) => (
                <div key={event.id} className="bg-muted/50 rounded p-3">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                  {event.detail && Object.keys(event.detail).length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {JSON.stringify(event.detail, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}