interface InlineIllustrationProps {
  url?: string | null;
  caption?: string | null;
}

export default function InlineIllustration({ url, caption }: InlineIllustrationProps) {
  if (!url) return null;
  
  return (
    <figure className="my-6 flex flex-col items-center">
      <img 
        src={url} 
        alt={caption ?? 'Illustration'} 
        className="max-h-72 rounded shadow" 
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center max-w-md">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}