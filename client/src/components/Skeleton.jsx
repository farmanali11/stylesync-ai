const Skeleton = ({ className }) => (
    <div className={'animate-pulse bg-gray-800 rounded-lg ' + className} />
  );
  
  export const StatCardSkeleton = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 mt-2" />
      <Skeleton className="h-3 w-20 mt-2" />
    </div>
  );
  
  export const TableRowSkeleton = () => (
    <tr className="border-b border-gray-800">
      <td className="px-6 py-4"><Skeleton className="h-4 w-36" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
    </tr>
  );
  
  export const ChatMessageSkeleton = () => (
    <div className="flex justify-start gap-3">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1 max-w-sm">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
  
  export const CardSkeleton = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <Skeleton className="h-5 w-40 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
  
  export const ChartSkeleton = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <Skeleton className="h-5 w-48 mb-6" />
      <div className="flex items-end gap-3 h-48">
        {[60, 80, 45, 90, 55, 70, 85].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: h + '%' }}
          />
        ))}
      </div>
    </div>
  );
  
  export default Skeleton;