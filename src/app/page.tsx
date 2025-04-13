import { ArticleCard } from '@/app/components/ArticleCard';

export default function Home() {
  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-2 gap-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <ArticleCard
          key={i}
          title="たいとる"
          publishedDate={new Date()}
          updatedDate={new Date()}
          tags={Array.from({ length: 3 }).map((_, j) => ({
            id: `${j}`,
            name: `タグ${j}`,
          }))}
        />
      ))}
    </div>
  );
}
