
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header Skeleton */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="w-48 h-8" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="w-64 h-10" />
              <Skeleton className="w-24 h-10" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Skeleton className="w-96 h-16 mx-auto mb-6" />
          <Skeleton className="w-2xl h-6 mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <Skeleton className="w-32 h-12" />
            <Skeleton className="w-40 h-12" />
          </div>
        </div>
      </section>

      {/* Products Skeleton */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <Skeleton className="w-64 h-8 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="group">
                <CardHeader className="p-0">
                  <Skeleton className="w-full h-48 rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="w-20 h-6 mb-2" />
                  <Skeleton className="w-full h-6 mb-2" />
                  <Skeleton className="w-full h-12 mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-20 h-8" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="w-full h-10" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoadingSkeleton;
